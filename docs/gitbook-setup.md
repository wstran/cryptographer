# GitBook Setup Guide

Hướng dẫn chi tiết cách setup và sync documentation với GitBook.

## Prerequisites

1. **GitHub Account** - Để host repository
2. **GitBook Account** - Để tạo documentation site
3. **Git** - Để quản lý version control

## Step 1: Setup GitBook Account

### 1.1 Tạo GitBook Account

1. Truy cập [gitbook.com](https://gitbook.com)
2. Click "Sign Up" hoặc "Get Started"
3. Chọn "Sign up with GitHub" (khuyến nghị)
4. Authorize GitBook để access GitHub account

### 1.2 Tạo Space mới

1. Sau khi login, click "Create a new space"
2. Chọn "Documentation" template
3. Đặt tên: `cryptographer.js`
4. Chọn visibility: Public (để ai cũng có thể đọc)
5. Click "Create space"

## Step 2: Connect với GitHub Repository

### 2.1 Connect Repository

1. Trong GitBook dashboard, click vào space vừa tạo
2. Vào Settings → Integrations
3. Tìm "GitHub" integration và click "Connect"
4. Chọn repository: `wstran/cryptographer`
5. Chọn branch: `main`
6. Click "Connect"

### 2.2 Configure Sync Settings

1. **Source Path**: `docs/` (thư mục chứa documentation)
2. **Branch**: `main`
3. **Auto-sync**: Enable (tự động sync khi có thay đổi)
4. **Build on push**: Enable (tự động build khi push)

## Step 3: Cấu trúc Documentation

### 3.1 Tạo file SUMMARY.md

Tạo file `docs/SUMMARY.md` để định nghĩa cấu trúc navigation:

```markdown
# Summary

* [Introduction](README.md)

## Getting Started

* [Installation](getting-started/installation.md)
* [Quick Start](getting-started/quick-start.md)

## API Reference

* [Hash Functions](api-reference/hash-functions.md)
* [HMAC Functions](api-reference/hmac-functions.md)
* [Cipher Functions](api-reference/cipher-functions.md)
* [Key Derivation Functions](api-reference/kdf-functions.md)

## Examples

* [Basic Usage](examples/basic-usage.md)

## Security

* [Best Practices](security/best-practices.md)

## Performance

* [Benchmarks](performance/benchmarks.md)

## Contributing

* [Contributing Guide](../CONTRIBUTING.md)
* [Security Policy](../SECURITY.md)
```

### 3.2 Tạo file README.md cho docs

Tạo file `docs/README.md`:

```markdown
# Cryptographer.js Documentation

Welcome to the **cryptographer.js** documentation. This guide covers everything you need to know to install, use, and contribute to the project.

## 🚀 Quick Start

Get started with cryptographer.js in minutes:

```bash
npm install cryptographer.js
```

```javascript
import crypto from 'cryptographer.js';

// SHA-256 hash
const hash = crypto.hash.sha256('Hello World');
console.log(hash); // 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// AES-256-CBC encryption
const encrypted = crypto.cipher.aes.encrypt('Hello World', {
  key: Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex'),
  iv: Buffer.from('0123456789abcdef0123456789abcdef', 'hex')
});

// Argon2id password hash
const passwordHash = crypto.kdf.argon2('p@ssw0rd');
```

## 📚 What's Inside

- **Getting Started** - Installation and basic setup
- **API Reference** - Complete function documentation
- **Examples** - Real-world usage examples
- **Security Guide** - Best practices and security considerations
- **Performance** - Benchmarks and optimization tips
- **Contributing** - How to contribute to the project

## 🎯 Key Features

- **High Performance** - Built with Rust and WebAssembly
- **Comprehensive** - Hash functions, ciphers, HMAC, and KDF
- **Type Safe** - Full TypeScript support
- **Node.js Optimized** - Designed for server-side applications
- **Well Tested** - Extensive test coverage
- **Production Ready** - Industry-standard implementations

## 📖 Navigation

Use the sidebar to navigate between sections. Each section provides detailed information and examples.
```

## Step 4: Customize GitBook Settings

### 4.1 Configure Site Settings

1. Vào Settings → General
2. **Site name**: `cryptographer.js`
3. **Description**: `High-performance cryptographic algorithms for Node.js using WebAssembly`
4. **Logo**: Upload logo nếu có
5. **Favicon**: Upload favicon nếu có

### 4.2 Configure Theme

1. Vào Settings → Appearance
2. **Theme**: Light (hoặc Dark tùy preference)
3. **Primary color**: Chọn màu brand (ví dụ: #007acc cho Node.js)
4. **Font**: System default hoặc custom font
5. **Code theme**: GitHub (hoặc Monokai, Dracula)

### 4.3 Configure Navigation

1. Vào Settings → Navigation
2. **Show table of contents**: Enable
3. **Show page navigation**: Enable
4. **Show search**: Enable
5. **Show edit on GitHub**: Enable (link về GitHub repo)

## Step 5: Setup Custom Domain (Optional)

### 5.1 Configure Custom Domain

1. Vào Settings → Domains
2. Click "Add custom domain"
3. Nhập domain: `cryptographer.gitbook.io`
4. Follow instructions để configure DNS

### 5.2 DNS Configuration

Thêm CNAME record:
```
Name: cryptographer
Value: gitbook.io
```

## Step 6: Test và Deploy

### 6.1 Test Local

1. Push changes lên GitHub:
```bash
git add docs/
git commit -m "Add GitBook documentation"
git push origin main
```

2. Kiểm tra GitBook sync:
- Vào GitBook dashboard
- Xem build status
- Kiểm tra preview

### 6.2 Verify Documentation

1. Kiểm tra tất cả links hoạt động
2. Kiểm tra code examples
3. Kiểm tra navigation structure
4. Test search functionality

## Step 7: Maintenance và Updates

### 7.1 Workflow cho Updates

1. **Edit documentation locally**:
```bash
# Edit files trong docs/
vim docs/api-reference/hash-functions.md
```

2. **Test locally** (optional):
```bash
# Install GitBook CLI nếu muốn test local
npm install -g gitbook-cli
gitbook serve docs/
```

3. **Commit và push**:
```bash
git add docs/
git commit -m "Update documentation: add new examples"
git push origin main
```

4. **GitBook auto-sync**: Documentation sẽ tự động update sau vài phút

### 7.2 Version Control

1. **Branch strategy**:
   - `main`: Production documentation
   - `develop`: Development documentation
   - Feature branches: Cho major updates

2. **Commit messages**:
```bash
git commit -m "docs: add HMAC examples"
git commit -m "docs: update security best practices"
git commit -m "docs: fix typo in installation guide"
```

## Step 8: Advanced Configuration

### 8.1 Custom CSS (Optional)

Tạo file `docs/styles/website.css`:

```css
/* Custom styles */
.book .book-summary {
    background-color: #f8f9fa;
}

.book .book-body .page-wrapper .page-inner {
    max-width: 1200px;
}

/* Code block styling */
.book .book-body .page-inner section pre {
    background-color: #f6f8fa;
    border: 1px solid #e1e4e8;
}

/* Table styling */
.book .book-body .page-inner section table {
    border-collapse: collapse;
    width: 100%;
}

.book .book-body .page-inner section table th,
.book .book-body .page-inner section table td {
    border: 1px solid #dfe2e5;
    padding: 8px 12px;
}
```

### 8.2 Custom JavaScript (Optional)

Tạo file `docs/styles/website.js`:

```javascript
// Custom JavaScript
gitbook.events.on('page.change', function() {
    // Add custom analytics
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_TRACKING_ID', {
            'page_title': document.title,
            'page_location': window.location.href
        });
    }
});

// Add copy button to code blocks
gitbook.events.on('page.change', function() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.className = 'copy-button';
        button.onclick = () => {
            navigator.clipboard.writeText(block.textContent);
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = 'Copy', 2000);
        };
        block.parentNode.appendChild(button);
    });
});
```

### 8.3 GitBook Configuration

Tạo file `docs/book.json`:

```json
{
    "title": "cryptographer.js Documentation",
    "description": "High-performance cryptographic algorithms for Node.js using WebAssembly",
    "author": "Wilson Tran",
    "language": "en",
    "structure": {
        "readme": "README.md",
        "summary": "SUMMARY.md"
    },
    "plugins": [
        "highlight",
        "search",
        "github",
        "theme-default",
        "fontsettings"
    ],
    "pluginsConfig": {
        "github": {
            "url": "https://github.com/wstran/cryptographer"
        },
        "theme-default": {
            "showLevel": true
        },
        "fontsettings": {
            "theme": "white",
            "family": "sans",
            "size": 2
        }
    }
}
```

## Troubleshooting

### Common Issues

1. **Sync không hoạt động**:
   - Kiểm tra GitHub integration
   - Kiểm tra branch settings
   - Kiểm tra file permissions

2. **Build errors**:
   - Kiểm tra Markdown syntax
   - Kiểm tra file paths trong SUMMARY.md
   - Kiểm tra image paths

3. **Custom domain không hoạt động**:
   - Kiểm tra DNS propagation (có thể mất 24-48h)
   - Kiểm tra CNAME record
   - Kiểm tra SSL certificate

### Debug Steps

1. **Check GitBook logs**:
   - Vào GitBook dashboard
   - Xem build logs
   - Kiểm tra error messages

2. **Test locally**:
```bash
# Install GitBook CLI
npm install -g gitbook-cli

# Serve locally
gitbook serve docs/

# Build static files
gitbook build docs/ _book/
```

3. **Check GitHub webhooks**:
   - Vào GitHub repository settings
   - Kiểm tra webhooks
   - Verify GitBook webhook

## Best Practices

### 1. Documentation Structure

- **Keep it organized**: Sử dụng clear hierarchy
- **Use consistent formatting**: Markdown standards
- **Include examples**: Code examples cho mọi feature
- **Update regularly**: Keep documentation current

### 2. Content Guidelines

- **Write for users**: Focus on practical usage
- **Include security notes**: Highlight security considerations
- **Provide benchmarks**: Show performance data
- **Include troubleshooting**: Common issues và solutions

### 3. Maintenance

- **Regular reviews**: Monthly documentation reviews
- **User feedback**: Collect và incorporate feedback
- **Version tracking**: Track documentation versions
- **Backup**: Regular backups của documentation

## Conclusion

Sau khi hoàn thành setup này, bạn sẽ có:

✅ **Professional documentation site** tại `cryptographer.gitbook.io`
✅ **Auto-sync** với GitHub repository
✅ **Search functionality** cho users
✅ **Mobile-responsive** design
✅ **Version control** cho documentation
✅ **Custom domain** (optional)

Documentation sẽ tự động update mỗi khi bạn push changes lên GitHub repository!