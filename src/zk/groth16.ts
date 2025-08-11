import { execFileSync } from 'child_process';
import { InvalidInputError, InvalidParameterError } from '../utils/validation';
import type { Groth16Proof, Groth16ProveResult, Groth16SerializeFormat } from '../types';

export function generateProof(
    circuit: Buffer | Uint8Array,
    zkey: Buffer | Uint8Array,
    inputs: Record<string, unknown>,
    timeout?: number
): Groth16ProveResult {
    const payload = {
        mode: 'prove' as const,
        circuit: circuit.toString('base64'),
        zkey: zkey.toString('base64'),
        inputs: inputs,
    };

    const stdout = invokeRunner(payload, timeout);
    const result = safeParse(stdout);
    if (!result || typeof result !== 'object' || !('proof' in result) || !('publicSignals' in result)) {
        throw new InvalidInputError('Invalid runner output for generateProof');
    }
    const proof = (result as any).proof as Groth16Proof;
    const publicSignalsResult = ((result as any).publicSignals as unknown[]).map(String);
    return { proof, publicSignals: publicSignalsResult };
}

export function verifyProof(
    vkey: Record<string, unknown>,
    proof: Record<string, unknown>,
    publicSignals: unknown[]
): boolean {
    const payload = {
        mode: 'verify' as const,
        vkey: vkey,
        proof: proof,
        publicSignals: publicSignals,
    };

    const stdout = invokeRunner(payload);
    const text = (stdout || '').trim().toLowerCase();
    if (text === 'true' || text === 'ok') return true;
    if (text === 'false') return false;
    const parsed = safeParse(stdout);
    if (typeof parsed === 'boolean') return parsed;
    return true;
}

export function serializeProof(data: Groth16ProveResult, format: Groth16SerializeFormat = 'buffer'): Buffer | string {
    const json = JSON.stringify({ proof: data.proof, publicSignals: data.publicSignals });
    switch (format) {
        case 'buffer':
            return Buffer.from(json, 'utf8');
        case 'base64':
            return Buffer.from(json, 'utf8').toString('base64');
        case 'hex':
            return Buffer.from(json, 'utf8').toString('hex');
        case 'json':
            return json;
        default:
            throw new InvalidParameterError(`Unsupported format: ${format}`);
    }
}

export function deserializeProof(input: Buffer | string): Groth16ProveResult {
    let buf: Buffer;
    if (Buffer.isBuffer(input)) buf = input;
    else if (typeof input === 'string') {
        if (/^[A-Fa-f0-9]+$/.test(input) && input.length % 2 === 0) buf = Buffer.from(input, 'hex');
        else if (/^[A-Za-z0-9+/=\r\n]+$/.test(input)) { try { buf = Buffer.from(input, 'base64'); } catch { buf = Buffer.from(input, 'utf8'); } }
        else buf = Buffer.from(input, 'utf8');
    } else throw new InvalidInputError('deserializeProof expects a Buffer or string');

    const parsed = safeParse(buf.toString('utf8'));
    if (!parsed || typeof parsed !== 'object' || !('proof' in parsed) || !('publicSignals' in parsed)) {
        throw new InvalidInputError('Invalid serialized proof payload');
    }
    return { proof: (parsed as any).proof as Groth16Proof, publicSignals: ((parsed as any).publicSignals as unknown[]).map(String) };
}

export const groth16 = { generateProof, verifyProof, serializeProof, deserializeProof };

// --------------- internal helpers ---------------
function invokeRunner(payload: any, timeout?: number): string {
    if (payload.mode === 'verify') {
        const payloadJson = JSON.stringify(payload);
        return execFileSync(process.execPath, ['-e', `
        const snarkjs = require('snarkjs');
        const payload = ${payloadJson};

        async function verify() {
            try {
            const ok = await snarkjs.groth16.verify(
                payload.vkey,
                payload.publicSignals,
                payload.proof
            );
            process.stdout.write(String(!!ok));
            process.exit(0);
            } catch (error) {
            process.stderr.write(String(error.message));
            process.exit(1);
            }
        }
        verify();
        `], {
            encoding: 'utf8',
            timeout: timeout ?? 300_000,
        });
    }

    const payloadJson = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadJson).toString('base64');

    return execFileSync(process.execPath, ['-e', `
        const snarkjs = require('snarkjs');

        async function prove() {
        try {
            // Decode payload from base64 (no file needed)
            const payloadJson = Buffer.from('${payloadBase64}', 'base64').toString('utf8');
            const payload = JSON.parse(payloadJson);

            // Decode base64 inputs
            const circuit = Buffer.from(payload.circuit, 'base64');
            const zkey = Buffer.from(payload.zkey, 'base64');
            const inputs = payload.inputs;

            // Use unique temp directory to avoid conflicts
            const tmpDir = require('os').tmpdir();
            const uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const circuitPath = require('path').join(tmpDir, 'circuit_' + uniqueId + '.wasm');
            const zkeyPath = require('path').join(tmpDir, 'zkey_' + uniqueId + '.zkey');
            const inputPath = require('path').join(tmpDir, 'input_' + uniqueId + '.json');

            try {
            // Write temporary files for snarkjs
            require('fs').writeFileSync(circuitPath, circuit);
            require('fs').writeFileSync(zkeyPath, zkey);
            require('fs').writeFileSync(inputPath, JSON.stringify(inputs));

            // Generate proof
            const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, circuitPath, zkeyPath);

            // Output result
            process.stdout.write(JSON.stringify({ proof, publicSignals }));
            process.exit(0);
            } finally {
            // Always cleanup temp files, even if error occurs
            const fs = require('fs');
            try { fs.unlinkSync(circuitPath); } catch {}
            try { fs.unlinkSync(zkeyPath); } catch {}
            try { fs.unlinkSync(inputPath); } catch {}
            }
        } catch (error) {
            process.stderr.write(String(error.message));
            process.exit(1);
        }
        }
        prove();
    `], {
        encoding: 'utf8',
        timeout: timeout ?? 300_000,
    });
}

function safeParse(s: string): any { try { return JSON.parse(s); } catch { return undefined; } }



