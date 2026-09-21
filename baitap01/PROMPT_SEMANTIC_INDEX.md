[Context]
Tôi đang có một website tĩnh trong thư mục baitap01/, sử dụng HTML và CSS thuần. Trang baitap01/index.html đang dùng nhiều thẻ <div> để tạo bố cục, gồm phần đầu trang, khu vực nội dung chính, bộ sưu tập hình ảnh, thanh điều hướng, sidebar và chân trang. File baitap01/css/style.css đang phụ thuộc vào các id/class hiện có để giữ nguyên giao diện.

Yêu cầu là refactor baitap01/index.html sang các thẻ semantic HTML5 để cải thiện SEO cơ bản. File baitap01/index_new.html phải là bản giữ nguyên bố cục và nội dung của index.html ban đầu để đối chiếu. Không được chỉnh sửa các file ngoài thư mục baitap01/.

[Role]
Bạn là một lập trình viên Front-end lão luyện, am hiểu HTML5 semantic, SEO on-page cơ bản, khả năng tương thích trình duyệt và cách bảo toàn giao diện của một website đang có CSS legacy.

[Action]
1. Đọc và phân tích baitap01/index.html cùng baitap01/css/style.css trước khi chỉnh sửa.
2. Tạo baitap01/index_new.html bằng cách sao chép nguyên trạng index.html ban đầu. File này phải giữ nguyên nội dung, hình ảnh, đường dẫn, bố cục, id và class của bản gốc.
3. Refactor baitap01/index.html bằng các thẻ semantic HTML5 phù hợp:
   - <header> cho phần đầu trang.
   - <nav> cho khu vực điều hướng.
   - <main> cho nội dung chính.
   - <section> cho khu vực gallery.
   - <article> cho nội dung bài viết chính.
   - <aside> cho sidebar.
   - <footer> cho chân trang.
4. Giữ nguyên toàn bộ nội dung văn bản, hình ảnh, liên kết, id, class và thứ tự hiển thị. Chỉ thay đổi các thẻ bao ngoài khi cần để chuyển sang semantic HTML5.
5. Có thể bổ sung lang="en" hoặc lang phù hợp và một thẻ meta description ngắn để cải thiện SEO cơ bản, nhưng không được làm thay đổi giao diện.
6. Không tạo layout mới, không đổi màu sắc, kích thước, font, khoảng cách, nội dung, đường dẫn ảnh hoặc cấu trúc CSS nếu không thật sự cần thiết.
7. Kiểm tra để bảo đảm HTML hợp lệ, thẻ mở/đóng cân bằng, không có id trùng lặp và các liên kết tài nguyên vẫn hoạt động.
8. Sau khi hoàn thành, kiểm tra sự khác nhau giữa index_new.html và index.html, giải thích rõ các thay đổi chỉ liên quan đến semantic/SEO.

[Format]
Trả về:
1. Nội dung hoàn chỉnh của baitap01/index.html sau khi refactor.
2. Nội dung hoàn chỉnh của baitap01/index_new.html là bản gốc được bảo toàn.
3. Bảng tóm tắt gồm: Thẻ semantic đã dùng | Vị trí thay thế | Lợi ích SEO/cấu trúc.
4. Danh sách các file đã tạo hoặc chỉnh sửa, chỉ thuộc thư mục baitap01/.
5. Không tự động commit hoặc push Git.

[Target]
Kết quả phải giữ giao diện và nội dung hiển thị giống index.html ban đầu, nhưng cấu trúc HTML rõ nghĩa hơn cho trình duyệt, công cụ tìm kiếm và trình đọc màn hình. Người dùng có thể mở trực tiếp baitap01/index.html và baitap01/index_new.html trên trình duyệt mà không cần server riêng.

Sau khi người dùng tự upload thư mục baitap01/ lên một host miễn phí như GitHub Pages, hãy hướng dẫn họ điền URL host vào phần kết quả bài tập. Không tự bịa URL nếu chưa biết tên tài khoản GitHub và repository.
