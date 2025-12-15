# AudioBook - Nền Tảng Sách Nói Trực Tuyến

## 📖 Giới Thiệu

AudioBook là một nền tảng sách nói trực tuyến toàn diện, cho phép người dùng nghe sách, quản lý audiobook, và chuyển đổi văn bản/hình ảnh thành giọng nói. Dự án bao gồm backend API với Spring Boot và frontend với React + TypeScript.

## 🏗️ Kiến Trúc Hệ Thống

```
AudioBook/
├── BEAudioBook/          # Backend API (Spring Boot)
│   └── AudioBook/
│       ├── src/
│       └── pom.xml
├── audio-book-clients/   # Frontend UI (React + TypeScript + Vite)
│   ├── src/
│   └── package.json
└── README.md
```

## ✨ Tính Năng Chính

### Người Dùng
- 🔐 **Xác thực**: Đăng ký, đăng nhập, quản lý hồ sơ
- 📚 **Quản lý Sách**: Duyệt, tìm kiếm, lọc sách theo danh mục và rating
- 🎧 **Nghe AudioBook**: Phát audio với điều khiển đầy đủ (play/pause, tốc độ, âm lượng)
- ⭐ **Đánh Giá & Review**: Đánh giá sách, viết nhận xét
- 📝 **Lịch Sử Nghe**: Theo dõi sách đã nghe
- 🎤 **Text-to-Speech (TTS)**: Chuyển văn bản thành giọng nói
- 🖼️ **Image-to-Speech (ITS)**: Chuyển hình ảnh thành giọng nói

### Quản Trị Viên
- 📖 **Quản Lý Sách**: CRUD sách, chương, audio
- 🏷️ **Quản Lý Danh Mục**: Tạo và quản lý thể loại sách
- 👥 **Quản Lý Người Dùng**: Xem và quản lý tài khoản
- 📊 **Thống Kê Đánh Giá**: Xem thống kê và biểu đồ đánh giá
- 🎵 **Tạo Audio**: Generate audio từ văn bản

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Framework**: Spring Boot 3.3.4
- **Java**: 17
- **Database**: MySQL
- **ORM**: Spring Data JPA
- **Security**: BCrypt Password Encoder
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### Backend Setup

1. **Clone repository**
```bash
git clone https://github.com/minhquang2002/AudioBook.git
cd AudioBook/BEAudioBook/AudioBook
```

2. **Cấu hình Database**
Tạo database MySQL và cập nhật `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/audiobook_db
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

3. **Build và chạy**
```bash
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### Frontend Setup

1. **Di chuyển đến thư mục frontend**
```bash
cd audio-book-clients
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy development server**
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:8081`

## 📡 API Endpoints

### Authentication
- `POST /user/register` - Đăng ký tài khoản
- `POST /user/login` - Đăng nhập
- `PUT /user/update-profile/{username}` - Cập nhật thông tin
- `PUT /user/change-password/{username}` - Đổi mật khẩu

### Books
- `GET /book/{categoryId}/{rating}` - Lấy danh sách sách (có filter)
- `GET /bookInCategory/page/{categoryId}/{page}` - Lấy sách phân trang
- `GET /book/{id}` - Chi tiết sách
- `POST /book` - Thêm sách mới (Admin)
- `PUT /book/{id}` - Cập nhật sách (Admin)
- `DELETE /book/{id}` - Xóa sách (Admin)
- `GET /featuredBook` - Lấy sách nổi bật
- `GET /searchBook/{keyword}/{categoryId}/{rating}` - Tìm kiếm sách

### Reviews
- `GET /{bookId}/reviews` - Lấy đánh giá của sách
- `POST /review` - Thêm đánh giá
- `DELETE /review/{id}` - Xóa đánh giá

### Categories
- `GET /category` - Lấy tất cả danh mục
- `POST /category` - Thêm danh mục (Admin)
- `PUT /category/{id}` - Cập nhật danh mục (Admin)
- `DELETE /category/{id}` - Xóa danh mục (Admin)

### Audio
- `GET /myAudio/{username}` - Lấy audio của user
- `POST /myAudio` - Upload audio
- `DELETE /myAudio/{id}` - Xóa audio

### History
- `GET /history/{username}` - Lịch sử nghe
- `POST /history` - Thêm lịch sử

## 📂 Cấu Trúc Dự Án

### Backend Structure
```
BEAudioBook/AudioBook/src/main/java/com/example/AudioBook/
├── controller/         # REST Controllers
├── service/           # Business Logic
│   └── impl/         # Service Implementations
├── repository/        # Data Access Layer
├── entity/           # JPA Entities
└── DTO/              # Data Transfer Objects
```

### Frontend Structure
```
audio-book-clients/src/
├── components/       # React Components
│   ├── admin/       # Admin Components
│   ├── books/       # Book Components
│   ├── layout/      # Layout Components
│   └── ui/          # UI Components (shadcn)
├── contexts/        # React Contexts
├── hooks/           # Custom Hooks
├── lib/             # API & Utils
└── pages/           # Page Components
```

## 🎨 Tính Năng Nổi Bật

### Phân Trang
- Hỗ trợ phân trang cho danh sách sách (10 sách/trang)
- Phân trang ở frontend khi filter rating
- Phân trang ở backend cho hiệu suất tốt hơn

### Tìm Kiếm
- Tìm kiếm theo tên sách và tác giả
- Filter theo danh mục và rating
- Kết quả tìm kiếm real-time

### Quản Lý Audio
- Upload và quản lý file audio
- Tích hợp TTS (Text-to-Speech)
- Tích hợp ITS (Image-to-Speech)
- Player với điều khiển đầy đủ

### Đánh Giá & Review
- Hệ thống rating 5 sao
- Comment và feedback
- Phân trang reviews
- Thống kê đánh giá với biểu đồ

## 🔒 Bảo Mật

- Mã hóa mật khẩu với BCrypt
- Xác thực người dùng
- Phân quyền Admin/User
- CORS configuration

## 🌐 Đa Ngôn Ngữ

Giao diện người dùng được viết hoàn toàn bằng tiếng Việt để phù hợp với người dùng Việt Nam.

## 📝 Database Schema

### Các Bảng Chính
- `user` - Thông tin người dùng
- `book` - Thông tin sách
- `category` - Danh mục sách
- `chapter` - Chương sách
- `audio` - File audio
- `review` - Đánh giá sách
- `my_audio` - Audio của người dùng
- `history` - Lịch sử nghe

## 🤝 Đóng Góp

Contributions, issues và feature requests đều được chào đón!

## 📄 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu.

## 👥 Tác Giả

- GitHub: [@minhquang2002](https://github.com/minhquang2002)

## 📞 Liên Hệ

- Email: contact@audiobook.com
- Phone: +84 123 456 789
- Address: Hà Nội, Việt Nam

---

Made with ❤️ by AudioBook Team
