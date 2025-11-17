# Timeline-Cleanse - Phân tích và Hướng dẫn Sử dụng

## 🎯 Tổng quan Project

**Timeline-Cleanse** (tên hiển thị: "Positivity Filter") là một **Chrome Extension** thông minh sử dụng AI Gemini 2.5 Flash Lite để **tự động lọc và ẩn nội dung tiêu cực** trên timeline mạng xã hội, đặc biệt là Twitter/X.

### Mục đích
- Bảo vệ sức khỏe tinh thần người dùng khỏi nội dung độc hại
- Tạo môi trường mạng xã hội tích cực hơn
- Cho phép người dùng chủ động kiểm soát những gì họ tiêu thụ trên internet

---

## 🔧 Chức năng Chi tiết

### 1. **Quét Bài viết Tự động**
**File**: `content.js` (dòng 24-45)

- Sử dụng `MutationObserver` API để theo dõi DOM
- Tự động phát hiện khi có bài đăng mới xuất hiện trên timeline
- Quét cả bài viết có sẵn và bài viết mới khi cuộn trang
- Chỉ phân tích các tweet có độ dài ≥ 10 ký tự để tối ưu hiệu suất

**Cơ chế hoạt động**:
```javascript
const observer = new MutationObserver((mutations) => {
  // Phát hiện node mới được thêm vào DOM
  // Scan các article[data-testid="tweet"]
});
```

### 2. **Phân tích Nội dung bằng AI**
**File**: `background.js` (dòng 8-51)

**Quy trình**:
1. Nhận văn bản từ content script
2. Lấy API key từ Chrome storage
3. Gửi request đến Gemini API với prompt phân tích
4. Gemini đánh giá xem nội dung có:
   - Toxic (độc hại)
   - Angry (giận dữ)
   - Hate speech (ngôn từ thù ghét)
   - Overly negative (quá tiêu cực)
5. Trả về kết quả JSON: `{ "isNegative": boolean }`

**Model sử dụng**: `gemini-2.5-flash-lite` (free tier)

**Endpoint**:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent
```

### 3. **Ẩn Nội dung Tiêu cực**
**File**: `content.js` (dòng 62-78)

**Khi phát hiện nội dung tiêu cực**:
- Ẩn văn bản gốc (`display: none`)
- Tạo badge màu xanh với icon sparkle: "✨ Negativity Blocked"
- Badge được style theo phong cách Twitter Blue
- Lưu giữ nội dung gốc trong memory

**Tính năng Tooltip**:
- Khi di chuột vào badge → Hiển thị tooltip với nội dung gốc
- Người dùng vẫn có quyền xem nội dung nếu muốn
- Tooltip xuất hiện mượt mà với animation

### 4. **Quản lý API Key**
**File**: `popup.html` + `popup.js`

- Giao diện đơn giản để nhập/lưu API key
- API key được lưu an toàn trong Chrome local storage
- Không gửi API key đến bất kỳ server nào ngoài Gemini API
- Hỗ trợ load lại key đã lưu

---

## 📂 Cấu trúc File và Kiến trúc

```
timeline-cleanse/
├── manifest.json          # Manifest v3 - Cấu hình extension
├── popup.html            # UI popup để nhập API key
├── popup.js              # Logic lưu/load API key
├── content.js            # Content script - Quét và xử lý DOM
├── background.js         # Service worker - Gọi Gemini API
├── styles.css            # CSS cho badge và tooltip
└── note/
    └── note.md          # File này - Tài liệu phân tích
```

### Kiến trúc Extension

```
┌─────────────────┐
│   Twitter/X     │
│   (Web Page)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  content.js     │◄─── Quét DOM, phát hiện tweet mới
│  (Content)      │     Tạo badge & tooltip
└────────┬────────┘
         │ chrome.runtime.sendMessage
         ▼
┌─────────────────┐
│ background.js   │◄─── Service Worker
│  (Background)   │     Gọi Gemini API
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini API     │◄─── Phân tích văn bản
│  (External)     │     Trả về isNegative
└─────────────────┘
```

---

## 💡 Tính năng Nổi bật

### ✅ **Ưu điểm**

1. **Miễn phí 100%**: Sử dụng free tier của Gemini 2.5 Flash Lite
2. **Real-time Processing**: Quét và lọc ngay khi nội dung xuất hiện
3. **Không mất thông tin**: Vẫn xem được nội dung gốc qua tooltip
4. **Privacy-First**:
   - API key lưu local
   - Không gửi dữ liệu về server của extension
   - Chỉ gửi văn bản cần phân tích đến Gemini
5. **UI/UX đẹp**: Badge thiết kế theo Twitter Blue design system
6. **Non-intrusive**: Không can thiệp vào chức năng của website
7. **Lightweight**: Code tối giản, hiệu suất cao

### ⚠️ **Hạn chế**

1. **Rate Limit**: Free tier Gemini có giới hạn request/ngày
2. **Twitter-specific**: Selector chỉ hoạt động với Twitter/X
3. **Không offline**: Cần internet để gọi Gemini API
4. **Độ chính xác**: Phụ thuộc vào khả năng phán đoán của AI
5. **Latency**: Có độ trễ nhỏ khi gọi API (thường < 1s)

---

## 📖 Hướng dẫn Sử dụng Chi tiết

### **Bước 1: Lấy API Key của Gemini**

1. Truy cập: [Google AI Studio](https://aistudio.google.com/api-keys)
2. Đăng nhập bằng tài khoản Google
3. Click nút **"Create API Key"**
4. Chọn Google Cloud project (hoặc tạo project mới)
5. Copy API key vừa được tạo
6. **Lưu ý**: Giữ API key bảo mật, không chia sẻ công khai

### **Bước 2: Cài đặt Extension vào Chrome**

1. Tải source code về máy (hoặc clone repo)
2. Mở Chrome browser
3. Truy cập: `chrome://extensions/`
4. Bật **"Developer mode"** ở góc trên bên phải
5. Click **"Load unpacked"**
6. Chọn thư mục `timeline-cleanse`
7. Extension sẽ xuất hiện trong danh sách

### **Bước 3: Cấu hình API Key**

1. Click vào icon extension trên thanh toolbar Chrome
2. Cửa sổ popup hiện ra với tiêu đề "Gemini Settings"
3. Paste API key vào ô input (type password)
4. Click nút **"Save Key"**
5. Thấy thông báo màu xanh: "Key saved! Reload your tabs."
6. **Quan trọng**: Reload lại tất cả các tab Twitter/X đang mở

### **Bước 4: Sử dụng trên Twitter/X**

1. Mở [Twitter/X](https://twitter.com) hoặc [X.com](https://x.com)
2. Đăng nhập tài khoản
3. Cuộn timeline như bình thường
4. Extension tự động làm việc ngầm:
   - Quét các tweet mới
   - Gửi nội dung đến Gemini AI
   - Ẩn tweet tiêu cực, hiển thị badge
5. Khi thấy badge **"✨ Negativity Blocked"**:
   - Di chuột vào badge → Xem nội dung gốc trong tooltip
   - Di chuột ra → Tooltip biến mất

### **Bước 5: Kiểm tra hoạt động**

**Cách test extension**:
1. Mở Chrome DevTools (F12)
2. Vào tab Console
3. Tìm các log từ extension
4. Nếu có lỗi API key → Kiểm tra lại cấu hình
5. Nếu badge không hiện → Kiểm tra network tab xem API call

---

## ⚙️ Cấu hình Nâng cao

### **Thay đổi Độ nhạy của AI**

Chỉnh sửa prompt trong `background.js` (dòng 18-27):

```javascript
const prompt = `
  Analyze this text: "${text}".

  Determine if it is toxic, angry, hate speech, or overly negative.

  // Thêm các tiêu chí khác nếu cần:
  // - Sarcasm (mỉa mai)
  // - Offensive language (ngôn ngữ xúc phạm)
  // - Political extremism (chính trị cực đoan)

  Return JSON:
  {
    "isNegative": boolean
  }
`;
```

### **Áp dụng cho Mạng xã hội khác**

Để extension hoạt động trên Facebook, Instagram, LinkedIn, v.v., cần:

1. **Tìm selector của platform đó**:
   - Mở DevTools trên trang web mục tiêu
   - Inspect element của bài đăng
   - Tìm selector chung cho tất cả bài đăng

2. **Cập nhật SELECTORS trong `content.js`**:
```javascript
const SELECTORS = {
  // Ví dụ cho Facebook:
  container: 'div[data-pagelet^="FeedUnit"]',
  textParams: 'div[dir="auto"]'

  // Ví dụ cho LinkedIn:
  // container: 'div.feed-shared-update-v2',
  // textParams: 'span.break-words'
};
```

3. **Test kỹ trên platform mới**

### **Tùy chỉnh UI Badge**

Chỉnh sửa `styles.css`:

```css
.gemini-blocked-badge {
  background-color: rgba(29, 155, 240, 0.1); /* Màu nền */
  color: #1d9bf0; /* Màu chữ */
  border-radius: 16px; /* Độ bo góc */
  font-size: 14px; /* Kích thước chữ */
  /* Thay đổi theo ý muốn */
}
```

### **Thay đổi Icon trong Badge**

Sửa `content.js` (dòng 71):
```javascript
badge.innerHTML = `<span>🚫 Blocked</span>`; // Thay ✨
// Hoặc:
badge.innerHTML = `<span>⚠️ Warning</span>`;
badge.innerHTML = `<span>🛡️ Filtered</span>`;
```

---

## 🔒 Bảo mật và Privacy

### **Dữ liệu được thu thập**
- ❌ Extension KHÔNG thu thập thông tin cá nhân
- ❌ KHÔNG gửi dữ liệu về bất kỳ server nào của developer
- ✅ CHỈ gửi nội dung văn bản đến Gemini API để phân tích
- ✅ API key lưu local trong Chrome storage

### **Permissions được yêu cầu**
```json
"permissions": ["storage", "scripting"]
```
- `storage`: Lưu API key vào local storage
- `scripting`: Inject content script vào web pages

```json
"host_permissions": ["https://generativelanguage.googleapis.com/*"]
```
- Cho phép gọi API đến Gemini

### **Best Practices**
1. Không chia sẻ API key với người khác
2. Định kỳ rotate API key (tạo key mới)
3. Monitor usage trên Google AI Studio
4. Nếu nghi ngờ key bị lộ → Xóa key cũ, tạo key mới

---

## 🐛 Xử lý Lỗi và Troubleshooting

### **Lỗi thường gặp**

#### 1. **Badge không hiện dù có nội dung tiêu cực**
**Nguyên nhân**:
- API key sai hoặc hết hạn
- Hết quota free tier
- Network bị chặn

**Giải pháp**:
```javascript
// Mở Console, check log:
// "Gemini Error:" → Xem chi tiết lỗi
// "No API Key" → Chưa cấu hình API key
```

#### 2. **Extension không quét được bài viết**
**Nguyên nhân**:
- Twitter thay đổi cấu trúc HTML
- Selector không còn đúng

**Giải pháp**:
- Inspect element tweet mới
- Cập nhật SELECTORS trong `content.js`

#### 3. **Tooltip không hiện**
**Nguyên nhân**:
- CSS bị override bởi website
- Z-index không đủ cao

**Giải pháp**:
```css
#gemini-tooltip-container {
  z-index: 999999 !important; /* Tăng z-index */
}
```

#### 4. **API call quá chậm**
**Nguyên nhân**:
- Gemini API server từ xa
- Free tier có throttling

**Giải pháp**:
- Thêm caching cho kết quả đã phân tích
- Giảm số lượng request bằng debounce

---

## 📊 Giới hạn và Rate Limits

### **Gemini Free Tier Limits**
(Cập nhật theo [Google AI Studio](https://aistudio.google.com))

- **Requests per minute (RPM)**: 15
- **Requests per day (RPD)**: 1,500
- **Tokens per minute (TPM)**: 1,000,000

### **Ước tính Sử dụng**
- 1 tweet trung bình: ~50 tokens
- Quét 100 tweet/phút → Có thể vượt RPM limit
- **Khuyến nghị**: Thêm debounce hoặc queue system

---

## 🚀 Ý tưởng Cải tiến

### **Tính năng có thể thêm**

1. **Caching thông minh**
   - Lưu kết quả phân tích vào localStorage
   - Tránh phân tích lại tweet đã scan

2. **Whitelist/Blacklist**
   - Cho phép user whitelist một số account
   - Blacklist keyword cụ thể

3. **Customizable Sensitivity**
   - Slider cho phép user điều chỉnh độ nhạy
   - Low/Medium/High sensitivity modes

4. **Statistics Dashboard**
   - Hiển thị số tweet đã lọc
   - Phân loại theo loại nội dung tiêu cực

5. **Multi-language Support**
   - Phân tích nội dung tiếng Việt, Nhật, Hàn...
   - Tùy chỉnh prompt theo ngôn ngữ

6. **Export Blocked Content**
   - Lưu log các tweet bị chặn
   - Export report hàng tuần/tháng

---

## 📝 Technical Details

### **Chrome Extension Manifest V3**
```json
{
  "manifest_version": 3,
  "name": "Positivity Filter",
  "version": "3.0"
}
```

### **Content Script Injection**
- Chạy trên `<all_urls>`
- Inject cả JS và CSS
- Isolated world (không conflict với page scripts)

### **Service Worker Background**
- Persistent: false (event-driven)
- Xử lý message từ content scripts
- Gọi external APIs

### **Communication Flow**
```
Content Script → chrome.runtime.sendMessage()
     ↓
Service Worker → fetch(Gemini API)
     ↓
Service Worker → sendResponse(result)
     ↓
Content Script → Update DOM
```

---

## 📚 Resources

### **Liên kết hữu ích**
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Twitter Web Selectors](https://developer.twitter.com/)

### **API Endpoint**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent
```

### **Request Format**
```json
{
  "contents": [
    {
      "parts": [
        { "text": "prompt here" }
      ]
    }
  ],
  "generationConfig": {
    "responseMimeType": "application/json"
  }
}
```

---

## 🎓 Kết luận

**Timeline-Cleanse** là một công cụ hữu ích giúp:
- ✅ Cải thiện trải nghiệm mạng xã hội
- ✅ Bảo vệ sức khỏe tinh thần
- ✅ Tận dụng AI miễn phí một cách thông minh
- ✅ Dễ sử dụng, không cần kiến thức kỹ thuật
- ✅ Open source, có thể tùy chỉnh theo nhu cầu

**Thích hợp cho**:
- Người dùng mạng xã hội muốn môi trường tích cực hơn
- Developer muốn học cách tích hợp AI vào Chrome Extension
- Người quan tâm đến mental health trong thời đại digital

**Không thích hợp cho**:
- Người cần đọc mọi thông tin (kể cả tiêu cực)
- Nhà báo, researcher cần monitor sentiment
- Người muốn kiểm soát 100% nội dung không bị AI lọc

---

**Phiên bản**: 3.0
**Ngày cập nhật**: 2025-11-17
**Tác giả phân tích**: Claude AI
