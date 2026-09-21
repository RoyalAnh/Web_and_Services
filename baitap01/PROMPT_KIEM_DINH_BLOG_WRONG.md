[CONTEXT]
Đây là một tệp HTML5 tên blog_wrong.html với nội dung một trang tin tức. Nó kèm 
bảng định kiểu CSS bên ngoài (css/style.css). Tệp này được xây dựng bằng cách thêm 
vào những sai sót cố tình, khác biệt với phiên bản tham chiếu chính thức. 
Tính chất khó tìm: hầu hết các lỗi vẫn cho kết quả hiển thị gần như như mong muốn 
trên các trình duyệt, bởi vì các trình duyệt có cơ chế tự phục hồi DOM. Đánh giá 
phải dựa trên tiêu chuẩn quy định của HTML (theo W3C/WHATWG spec), không dựa vào 
cách nó nhìn trên màn hình. Công cụ như validator.w3.org là chuẩn mực tham khảo.

[ROLE]
Hành động như một kiểm soát viên kỹ thuật HTML, có background sử dụng W3C Nu Html 
Checker hoặc các công cụ validate tương tự. Yêu cầu chặt chẽ với quy chuẩn nhưng 
luôn cần bằng chứng: mỗi lỗi phải trích dẫn được từ đặc tả kỹ thuật, không được 
báo dựa trên kinh nghiệm cá nhân hay tuỳ chọn lập trình.

[ACTION]
1. Thực hiện quét toàn bộ nội dung tệp blog_wrong.html được dán dưới đây, lần lượt 
   từng dòng lệnh.
2. Tìm kiếm và thống kê đầy đủ các vấn đề không tuân theo chuẩn HTML. Cần chú ý 
   kỹ lưỡng tới:
   - Giá trị charset: có được IANA công nhận hay không.
   - Các thuộc tính lặp lại (trùng) trên cùng một phần tử.
   - Số lượng thẻ <title>, <link>, <meta> trong <head> vượt giới hạn cho phép.
   - Giá trị id bị xung đột (trùng nhau) trong toàn bộ tài liệu.
   - Các thành phần con được đặt trong thành phần cha mà không được phép (sai hierarchy).
   - Thẻ đóng/mở không tương ứng, hoặc mở rồi quên đóng dẫn tới cấu trúc rối.
   - Dấu & trong attribute chưa được chuyển đổi thành &amp;.
3. Ghi rõ từng trường hợp: Số dòng | Đoạn sai | Loại sai | Điểm quy định bị vi phạm | 
   Tác động | Phương pháp khắc phục.
4. Cung cấp lại tệp đã được sửa chữa. Chỉ thay đổi những phần có lỗi được khai báo, 
   phần còn lại giữ y hệt.

[NHỮNG HẠNG MỤC KHÔNG ĐƯỢC CHỈNH SỬA — DANH SÁCH BẢO VỆ]
Tệp này chứa một số đoạn mã trông bất thường nhưng lại tuân theo quy định. Đây 
là các bẫy cố ý. Không được sửa hoặc thêm vào danh sách lỗi:
  a) Phần tử <i> sử dụng để tạo chữ in nghiêng — vẫn là cách viết hợp lệ trong 
     HTML5, ĐỪNG thay thế bằng <em>.
  b) Tên các sự kiện (event) như onBlur, onFocus có chữ hoa lẫn thường — HTML 
     không phân biệt chữ hoa/thường với tên thuộc tính, nên ĐỪNG đổi thành chữ 
     thường toàn bộ.
  c) Chuỗi javascript: xuất hiện bên trong giá trị onBlur/onFocus — đó là một 
     nhãn (protocol label) trong JavaScript, hoàn toàn đúng, ĐỪNG gỡ bỏ.
  d) Ký tự > nằm lẻ trong văn bản (chẳng hạn "Read more >>") — được phép viết 
     vậy, không nhất thiết phải đổi thành &gt;.
  e) Các thẻ tự đóng <meta>, <img>, <input>, <link> viết không có dấu gạch chéo 
     / ở cuối — đó là cách HTML5 quy định, ĐỪNG thêm " />" vào.
  f) Thuộc tính type="text/css" trên thẻ <link> — được chỉ định, chỉ là dư thôi, 
     ĐỪNG xoá.
  g) Thẻ <a> không có nội dung được sử dụng làm biểu tượng mạng xã hội — hợp lệ 
     vì icon được kích hoạt bằng CSS sprite, ĐỪNG chèn text hay <img> vào.
  h) Giá trị width/height viết kiểu số nguyên không có đơn vị (ví dụ height="24") 
     — đúng theo tiêu chuẩn, ĐỪNG đổi sang CSS hay thêm px.

Không được thực hiện "nâng cấp" khác: không thêm thuộc tính lang, viewport meta, 
description, rel="noopener", ARIA, hoặc các thẻ ngữ nghĩa <header>/<nav>/<main>; 
không tái định dạng code; không đổi tên lớp. Nếu thấy một chỗ cần cải tiến, hãy 
ghi vào mục "Ghi chú cải tiến" ở cuối, không chỉnh sửa mã.

Trước mỗi thay đổi, hỏi: "Đây có phải là vi phạm chuẩn HTML không, hay chỉ là 
sở thích viết code của người khác?" Nếu là thứ hai — thôi không sửa.

[FORMAT]
Phần A — Bảng tóm tắt, gồm các cột: Thứ tự | Dòng | Mã lỗi | Hạng mục lỗi | 
          Quy chuẩn bị ảnh hưởng | Hệ quả | Thay đổi.
          Hạng mục lỗi chọn một trong: cú pháp thẻ / thẻ đóng/mở không khớp / 
          thuộc tính không hợp lệ / cấu trúc phần tử sai chỗ.
Phần B — Toàn bộ nội dung tệp sau khi sửa, trong khối code.
Phần C — Bảng xác nhận: "Các đoạn được kiểm duyệt và xác định hợp lệ" — liệt kê 
          từng trường hợp ở (a)–(h) kèm lý do tại sao nó không phải lỗi.
Phần D — Ghi chú cải tiến: những điểm có thể nâng cấp nhưng không được áp dụng 
          vào mã.

[TONE]
Trực tiếp, kỹ thuật, khách quan. Không cần lời mở đầu dài. Khi chưa chắc chắn 
một vấn đề có phải lỗi không, phải ghi "không chắc chắn" kèm giải thích thay vì 
quyết định tùy ý.

--- NỘI DUNG FILE blog_wrong.html ---
<dán toàn bộ mã nguồn kèm số dòng vào đây>
