# StudyRoom Booking

Ứng dụng Expo/React Native đặt phòng học, dùng API Node.js và SQLite thật.

## Chạy trên Android Emulator

Mở terminal thứ nhất:

```bash
npm run server
```

Giữ terminal đó chạy. Mở terminal thứ hai:

```bash
npx expo start --clear
```

Sau khi Metro sẵn sàng, nhấn `a` để mở trên emulator.

## Chạy phiên bản desktop web

Giữ backend chạy trong terminal thứ nhất:

```bash
npm run server
```

Mở terminal thứ hai:

```bash
npm run web
```

Web chạy tại địa chỉ Metro hiển thị, mặc định là `http://localhost:8081`. Phiên bản web dùng entry `App.web.js` và layout desktop riêng gồm topbar, sidebar, dashboard, bộ lọc dạng toolbar, room grid, modal booking và bảng quản lý booking.


## Chức năng

- Đăng ký và đăng nhập bằng tài khoản lưu trong SQLite.
- Token đăng nhập có chữ ký HMAC, mật khẩu hash bằng `scrypt` và salt riêng.
- Chọn ngày, giờ bắt đầu và kết thúc trước khi tìm phòng.
- Kiểm tra và hiển thị trạng thái phòng theo đúng ngày/giờ đã chọn.
- Tìm kiếm nhiều tham số: từ khóa, kích cỡ, vị trí, trạng thái, tiện nghi và sức chứa tối thiểu.
- Tạo, xem lịch sử, lọc và hủy booking.
- Đồng bộ trạng thái phòng/booking tức thời giữa web và Android bằng WebSocket, có tự kết nối lại sau khi mất mạng.
- Thông báo hệ thống trên Android, Browser Notification trên web và nhắc lịch Android trước giờ sử dụng 15 phút.
- Dark mode áp dụng toàn bộ giao diện Android và web.
- Room Detail, Help và About đầy đủ trên cả hai nền tảng.
- Profile, trợ giúp, giới thiệu và đăng xuất.
- Ảnh phòng được đóng gói cục bộ trong app, không phụ thuộc internet.
- Booking tự chuyển sang `completed` sau giờ kết thúc; phòng được giải phóng cho các khung giờ tiếp theo.

## Chống hai người đặt trùng phòng

Khi xác nhận, backend bắt đầu `BEGIN IMMEDIATE` transaction trong SQLite rồi kiểm tra lại khoảng thời gian:

```text
existing.start < requested.end AND existing.end > requested.start
```

Yêu cầu được transaction xác nhận trước sẽ tạo booking. Yêu cầu đến sau bị trả `409 BOOKING_CONFLICT`; UI hiển thị thông báo và yêu cầu chọn phòng hoặc giờ khác. Trạng thái hiển thị trước đó không được dùng làm quyết định cuối cùng.

Backend chạy bộ kiểm tra booking hết hạn mỗi 30 giây và trước các API quan trọng. Booking có `date + end_time` nhỏ hơn hoặc bằng thời gian hiện tại được chuyển từ `confirmed` sang `completed`. Chỉ booking `confirmed` mới tham gia kiểm tra conflict.

## Kiểm tra API

Khi backend đang chạy:

```bash
npm run test:api
```

Test này kiểm tra đăng nhập, tìm kiếm đa tham số, sự kiện WebSocket, hủy booking và gửi đồng thời hai booking giống nhau để xác nhận kết quả chỉ có một `201`, yêu cầu còn lại nhận `409`.

## Thông báo hệ thống và push notification

- Trên Android Emulator/Expo Go: app dùng notification hệ thống cục bộ và lịch nhắc trước 15 phút.
- Trên web: bật thông báo trong Cài đặt rồi cho phép Browser Notification khi trình duyệt hỏi.
- Để nhận remote push khi app Android đã đóng, tạo EAS project/development build, cấu hình FCM cho dự án và chạy Metro với project ID thật:

```bash
EXPO_PUBLIC_EAS_PROJECT_ID=YOUR_EAS_PROJECT_UUID npx expo start --clear
```

Push token được đăng ký với backend SQLite. Backend chỉ gửi push khi người dùng đang bật thông báo. Không đặt UUID giả vào `app.json`.

## Cấu hình API

Android Emulator dùng mặc định `http://10.0.2.2:4000`. Có thể đổi bằng biến môi trường:

```bash
EXPO_PUBLIC_API_URL=http://YOUR_IP:4000 npx expo start --clear
```
