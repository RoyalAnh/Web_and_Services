# Hai prompt xây dựng giao diện

## Prompt 1: CSS thông thường

**[Context]** Tôi đang làm một trang web giới thiệu xưởng in letterpress thủ công có tên Blakletterpress bằng HTML và CSS đơn giản. File HTML gốc đã có sẵn nội dung tiếng Việt, gồm phần giới thiệu, ảnh đội ngũ, giá trị cốt lõi, thông tin đội ngũ, form liên hệ, bài viết gần đây và footer. Các hình ảnh cần dùng nằm trong thư mục `images`. Ảnh minh họa giao diện nằm ở `BaiTapCSS/Ex.png`.

**[Role]** Bạn là một lập trình viên Front-end lão luyện, chuyên xây dựng giao diện website tĩnh có bố cục rõ ràng và responsive.

**[Action]** Hãy xây dựng giao diện cho trang HTML bằng CSS thông thường, không sử dụng framework CSS. Bám sát ảnh minh họa `Ex.png`: header màu đen có tên thương hiệu và tagline, thanh điều hướng tối, phần nội dung được căn giữa với bố cục hai cột, sidebar bài viết gần đây, ảnh giới thiệu lớn, các thẻ Giá trị cốt lõi, các thẻ Đội ngũ, form Liên hệ và footer màu đen. Giữ nguyên nội dung, cấu trúc HTML có sẵn và đường dẫn tương đối đến thư mục `images`. Bổ sung responsive để trang hiển thị tốt trên máy tính và điện thoại.

**[Format]** Trả về hai file mã nguồn hoàn chỉnh: `trang-goc.html` và `style.css`. File HTML phải liên kết đúng với `style.css`, sử dụng HTML semantic và không viết CSS trực tiếp trong thuộc tính `style`. Có comment ngắn bằng tiếng Việt ở những phần CSS cần giải thích.

**[Target]** Giao diện tối giản, dễ đọc, nền sáng, header và footer tối, màu nhấn vàng/nâu nhẹ, nội dung căn giữa, khoảng cách và tỷ lệ gần giống ảnh minh họa. Ảnh phải hiển thị đúng tỷ lệ, form dễ sử dụng và không xuất hiện thanh cuộn ngang trên màn hình nhỏ.

## Prompt 2: Tailwind CSS

**[Context]** Tôi đang làm một trang web giới thiệu xưởng in letterpress thủ công có tên Blakletterpress bằng HTML. File HTML gốc đã có sẵn nội dung tiếng Việt, gồm phần giới thiệu, ảnh đội ngũ, giá trị cốt lõi, thông tin đội ngũ, form liên hệ, bài viết gần đây và footer. Các hình ảnh cần dùng nằm trong thư mục `images`. Ảnh minh họa giao diện nằm ở `BaiTapCSS/Ex.png`.

**[Role]** Bạn là một lập trình viên Front-end lão luyện, có kinh nghiệm sử dụng Tailwind CSS để xây dựng website tĩnh responsive.

**[Action]** Hãy xây dựng một phiên bản giao diện độc lập bằng Tailwind CSS. Sử dụng Tailwind CSS qua CDN trong file HTML để có thể mở trực tiếp mà không cần bước build. Bám sát ảnh minh họa `Ex.png`: header màu đen có tên thương hiệu và tagline, thanh điều hướng tối, phần nội dung được căn giữa với bố cục hai cột, sidebar bài viết gần đây, ảnh giới thiệu lớn, các thẻ Giá trị cốt lõi, các thẻ Đội ngũ, form Liên hệ và footer màu đen. Giữ nguyên nội dung, cấu trúc HTML semantic và đường dẫn tương đối đến thư mục `images`. Bổ sung các class responsive của Tailwind để trang hiển thị tốt trên máy tính và điện thoại.

**[Format]** Trả về một file mã nguồn hoàn chỉnh tên `trang-tailwind.html`. File phải chứa đầy đủ nội dung HTML, liên kết Tailwind CSS CDN trong phần `head` và dùng class Tailwind trực tiếp trên các phần tử. Không tạo thêm file CSS riêng nếu không thực sự cần thiết. Có comment ngắn bằng tiếng Việt ở những phần HTML cần giải thích.

**[Target]** Giao diện tối giản, dễ đọc, nền sáng, header và footer tối, màu nhấn vàng/nâu nhẹ, nội dung căn giữa, khoảng cách và tỷ lệ gần giống ảnh minh họa. Hai phiên bản phải có giao diện tương đương nhau; ảnh phải hiển thị đúng tỷ lệ, form dễ sử dụng và không xuất hiện thanh cuộn ngang trên màn hình nhỏ.
