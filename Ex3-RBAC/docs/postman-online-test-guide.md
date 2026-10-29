# Hướng dẫn chạy API online và Postman T01–T24

Hướng dẫn này dành cho Windows PowerShell và API online:

- Frontend: `https://www.pqahust.dev/Ex3-RBAC/frontend/index.html`
- API origin: `https://web-and-services-rbac.onrender.com`
- API base: `https://web-and-services-rbac.onrender.com/api/v1`
- Collection: `../postman/RBAC-T01-T24.postman_collection.json`

## An toàn trước khi kiểm thử

- Dùng demo account và dữ liệu thử; không dùng tài khoản thật của người khác.
- Không ghi mật khẩu, Atlas URI hay bearer token vào ảnh chụp, báo cáo, GitHub hoặc chat.
- Mật khẩu T06/T07/T09 trong collection chỉ dành cho tài khoản dùng một lần.
- T15 thu hồi vai trò manager; T17 xóa mềm tài khoản. Vì vậy, `managerUserId` và `softDeleteUserId` phải là tài khoản dùng một lần, không dùng bốn tài khoản demo chính.
- Collection đã sắp xếp T16 trước T15 để T16 thực sự kiểm tra giới hạn của manager trước khi role manager bị thu hồi.
- T06 tạo một user thử; sau lần chạy, xóa mềm tài khoản thử bằng super-admin. T17 đã xóa user thử của nó.
- Render Free có thể cần thời gian khởi động. Nếu lệnh đầu timeout, kiểm tra `/health`, đợi service live rồi chạy lại.

## 1. Import collection và chuẩn bị biến

Trong Postman:

1. Chọn **Import** → **File** → chọn file collection phía trên.
2. Tạo một Environment mới, ví dụ `RBAC Online Demo`.
3. Thêm các biến sau. `baseUrl` không có `/api/v1`; các ID/token lấy theo phần tiếp theo. Đánh dấu token/password là **Secret** nếu Postman cho phép và không chia sẻ Environment.

| Variable | Giá trị |
|---|---|
| `baseUrl` | `https://web-and-services-rbac.onrender.com` |
| `adminToken` | access token của `admin@example.test` |
| `managerToken` | token của **manager thử dùng một lần**, tạo riêng cho T12/T15 |
| `auditorToken` | access token của `auditor@example.test` |
| `memberToken` | access token của `member@example.test` |
| `managerUserId` | ID của manager thử dùng một lần ở trên |
| `superAdminRoleId` | ID role `super-admin` từ GET `/api/v1/roles` |
| `managerRoleId` | ID role `user-manager` |
| `auditorRoleId` | ID role `auditor` |
| `memberRoleId` | ID role `member` |
| `softDeleteUserId` | ID của member thử dùng một lần tạo riêng trước T17 |
| `softDeleteEmail` | email của user thử dùng một lần ở trên |
| `softDeletePassword` | mật khẩu thử riêng của user đó; đánh dấu Secret |
| `roleInUseId` | ID role `support-observer` (đang được auditor dùng) |
| `customRoleId` | Cũng là ID role `support-observer`, dùng cho T22 |
| `duplicateRoleCode` | `support-observer` |
| `createdUserId` | để trống; T06 tự điền |
| `testEmail` | để trống; T06 tự tạo email duy nhất |

Collection dùng header `Authorization: Bearer {{...Token}}`. Chọn Environment vừa tạo trước khi chạy.

### Lấy token, role ID và ID tài khoản thử

Đăng nhập bốn demo account riêng rẽ ở `POST /api/v1/auth/tokens`; lấy `accessToken` từ response để gán vào các biến token tương ứng. Không dán token vào tài liệu hay ảnh.

Body đăng nhập:

```json
{
  "grantType": "password",
  "email": "admin@example.test",
  "password": "<mật khẩu trong file .env cục bộ>"
}
```

Manager dùng cho T12/T15 nên là tài khoản tạm: đăng nhập bằng super-admin, tạo một user có role `user-manager`, rồi đăng nhập tài khoản tạm đó để lấy token. T15 sẽ gỡ role manager của tài khoản này. Không dùng tài khoản manager demo chính làm `managerUserId`.

Tạo một user member tạm bằng super-admin cho T17. Lấy `id`, email và mật khẩu của chính user tạm này để điền `softDelete*`.

Lấy ID các role từ `GET /api/v1/roles` với bearer super-admin. Response là `{ "data": [ { "id": "...", "code": "..." } ], "meta": ... }`. `support-observer` phải đang được gán cho ít nhất một user để T21 trả 409; seed mặc định gán nó cho auditor.

## 2. Kiểm tra từng request T01–T24

Trong bảng, `API` là `https://web-and-services-rbac.onrender.com/api/v1`. Cột “Output mong đợi” nêu status và cấu trúc chính; ID, thời gian, dữ liệu trong `data` có thể khác. Body để trống nghĩa là không gửi JSON body. Thực hiện lần lượt; T06 đặt `createdUserId` và `testEmail` để các request kế tiếp dùng.

| Test | Request và body | Expected output |
|---|---|---|
| **T01 — Chưa đăng nhập** | `GET API/users`, không Authorization | `401`; `{"error":{"code":"UNAUTHENTICATED",...}}` |
| **T02 — Member không được đọc users** | `GET API/users`, token member | `403`; `{"error":{"code":"FORBIDDEN",...}}` |
| **T03 — Auditor phân trang** | `GET API/users?page=2&limit=3&sort=fullName`, token auditor | `200`; `meta.page=2`, `meta.limit=3`, có `totalItems`, `totalPages` |
| **T04 — Tìm kiếm/lọc** | `GET API/users?q=demo&status=active`, token auditor | `200`; có ít nhất một phần tử; mọi kết quả `active` và tên/email có `demo` |
| **T05 — limit ngoài phạm vi** | `GET API/users?limit=500`, token auditor | `400`; `error.code=INVALID_QUERY_PARAMETER` |
| **T06 — Tạo user** | `POST API/users`, body ở dưới, token manager | `201`; body user có `id`, response header `Location` chứa ID; không có `passwordHash`. Collection lưu `createdUserId` |
| **T07 — Email trùng** | `POST API/users`, cùng `{{testEmail}}`, token manager | `409`; `error.code=EMAIL_ALREADY_EXISTS` |
| **T08 — Mật khẩu yếu** | `POST API/users`, email mới, `password:"123"`, token manager | `400`; `error.details` có `issue:"WEAK_PASSWORD"` |
| **T09 — Manager tự cấp super-admin** | `POST API/users`, `roleIds:[superAdminRoleId]`, token manager | `403`; `error.code=PRIVILEGE_ESCALATION` |
| **T10 — PATCH một phần** | `PATCH API/users/{{createdUserId}}`, đổi phone, token manager | `200`; phone mới; `fullName` vẫn là `Postman Created User` |
| **T11 — Chặn mass assignment** | `PATCH API/users/{{createdUserId}}`, body `{"roles":[]}`, token manager | `400`; `FIELD_NOT_ALLOWED` ở code và details |
| **T12 — Manager tự khóa mình** | `PATCH API/users/{{managerUserId}}`, body `{"status":"locked"}`, token manager dùng một lần | `403`; `error.code=SELF_ACTION_FORBIDDEN` |
| **T13 — Gán auditor lặp** | Hai lần `PUT API/users/{{createdUserId}}/roles/{{auditorRoleId}}`, token manager | Cả hai `204`; gán lặp idempotent |
| **T14 — Manager gán super-admin** | `PUT API/users/{{createdUserId}}/roles/{{superAdminRoleId}}`, token manager | `403`; `error.code=PRIVILEGE_ESCALATION` |
| **T16 — Manager không được xóa user** | `DELETE API/users/{{createdUserId}}`, token manager, chạy trước T15 | `403`; `error.code=FORBIDDEN` |
| **T15 — Thu hồi manager có hiệu lực ngay** | `DELETE API/users/{{managerUserId}}/roles/{{managerRoleId}}`, token admin | `204`; script assertion tiếp theo dùng token manager cũ gọi GET `/users` và phải nhận `403 FORBIDDEN` |
| **T17 — Xóa mềm** | `DELETE API/users/{{softDeleteUserId}}`, token admin | `204`; script kiểm tra GET cùng ID trả `404`, login bằng softDeleteEmail/password trả `401 INVALID_CREDENTIALS` |
| **T18 — ID sai định dạng** | `GET API/users/abc`, token auditor | `404`; `error.code=USER_NOT_FOUND` |
| **T19 — Mã role trùng** | `POST API/roles`, body ở dưới, token admin | `409`; `error.code=ROLE_CODE_EXISTS` |
| **T20 — Không sửa permissions của system role** | `PUT API/roles/{{memberRoleId}}/permissions`, body `{"permissions":[]}`, token admin | `409`; `error.code=SYSTEM_ROLE_PROTECTED` |
| **T21 — Không xóa role đang được dùng** | `DELETE API/roles/{{roleInUseId}}`, token admin | `409`; `error.code=ROLE_IN_USE` |
| **T22 — Permission không tồn tại** | `PUT API/roles/{{customRoleId}}/permissions`, body `{"permissions":["users:fly"]}`, token admin | `400`; `error.code=PERMISSION_NOT_FOUND` |
| **T23 — Giả mạo header role** | `POST API/users` với token member và `X-User-Role: super-admin`, body ở dưới | `403`; `error.code=FORBIDDEN` |
| **T24 — JSON lỗi cú pháp** | `POST API/auth/tokens`, body raw chỉ là `{`, không cần token | `400`; `error.code=MALFORMED_JSON` |

### Request body chính xác

**T06 — tạo user** (collection tự thay email bằng giá trị duy nhất):

```json
{
  "email": "{{testEmail}}",
  "fullName": "Postman Created User",
  "phone": "+84911222333",
  "password": "RbacTest1!",
  "roleIds": ["{{memberRoleId}}"]
}
```

**T07 — email trùng:** dùng lại `{{testEmail}}` từ T06:

```json
{
  "email": "{{testEmail}}",
  "fullName": "Duplicate User",
  "password": "RbacTest1!"
}
```

**T08 — mật khẩu yếu:**

```json
{
  "email": "weak-{{testEmail}}",
  "fullName": "Weak Password",
  "password": "123"
}
```

**T09 — thử leo thang quyền:**

```json
{
  "email": "escalation-{{testEmail}}",
  "fullName": "Escalation Attempt",
  "password": "RbacTest1!",
  "roleIds": ["{{superAdminRoleId}}"]
}
```

**T10 — cập nhật một trường:**

```json
{
  "phone": "+84911222334"
}
```

**T11 — field không được phép:**

```json
{
  "roles": []
}
```

**T12 — tự khóa manager thử:**

```json
{
  "status": "locked"
}
```

**T19 — mã role đã tồn tại:**

```json
{
  "code": "support-observer",
  "name": "Duplicate Role",
  "permissions": []
}
```

**T20 — system role:**

```json
{
  "permissions": []
}
```

**T22 — permission lạ:**

```json
{
  "permissions": ["users:fly"]
}
```

**T23 — giả mạo vai trò qua header:**

```json
{
  "email": "spoofed@example.test",
  "fullName": "Spoofed Role",
  "password": "RbacTest1!",
  "roleIds": []
}
```

**T24 — body raw:** `{` (không phải JSON hợp lệ).

### Ví dụ response mong đợi

Các response lỗi dùng dạng chung:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "..."
  }
}
```

Ví dụ cụ thể:

```json
// T01
{"error":{"code":"UNAUTHENTICATED","message":"..."}}

// T11
{"error":{"code":"FIELD_NOT_ALLOWED","message":"...","details":[{"field":"roles","issue":"FIELD_NOT_ALLOWED","message":"..."}]}}

// T15
HTTP/1.1 204 No Content

// T24
{"error":{"code":"MALFORMED_JSON","message":"..."}}
```

## 3. Chạy Collection Runner

1. Mở collection **IT4409 Fullstack RBAC — T01-T24**.
2. Chọn **Run collection**.
3. Chọn environment `RBAC Online Demo`.
4. Giữ thứ tự chạy collection. T16 phải nằm trước T15.
5. Chạy một iteration.
6. Kiểm tra summary và từng test assertion; kỳ vọng các test đều xanh. Nếu lỗi do thiếu/nhầm ID, sửa environment variables rồi chạy lại với tài khoản thử mới.
7. Sau khi hoàn tất, xóa mềm (qua super-admin) các tài khoản thử tạo bởi T06 và manager thử nếu chúng còn hoạt động. T17 đã xóa user thử của nó. Không xóa bốn demo account.
8. Chụp ảnh màn hình Runner nếu muốn kèm minh chứng: thấy tên collection, URL/environment không lộ secrets, tổng passed/failed.

## 4. Chạy một số request bằng curl.exe (PowerShell)

Các lệnh dưới đây dùng PowerShell, `curl.exe` và biến trong bộ nhớ. Không dùng `curl` alias. Có thể đặt token vào biến từ Postman login response; đừng ghi token vào file hoặc ảnh.

```powershell
$api = 'https://web-and-services-rbac.onrender.com/api/v1'
$adminToken = '<dán accessToken super-admin vào bộ nhớ PowerShell>'
$managerToken = '<token manager thử dùng một lần>'
$auditorToken = '<dán accessToken auditor vào bộ nhớ PowerShell>'
$memberToken = '<dán accessToken member vào bộ nhớ PowerShell>'
```

**T01 — không token, kỳ vọng 401:**

```powershell
curl.exe -i "$api/users"
```

Body mẫu:

```json
{"error":{"code":"UNAUTHENTICATED","message":"..."}}
```

**T02 — member, kỳ vọng 403:**

```powershell
curl.exe -i "$api/users" -H "Authorization: Bearer $memberToken"
```

Body mẫu:

```json
{"error":{"code":"FORBIDDEN","message":"..."}}
```

**T03 — auditor phân trang, kỳ vọng 200:**

```powershell
curl.exe -i "$api/users?page=2&limit=3&sort=fullName" -H "Authorization: Bearer $auditorToken"
```

Output cần có `meta.page=2`, `meta.limit=3`, `meta.totalItems`, `meta.totalPages`.

**T04 — tìm tài khoản demo, kỳ vọng 200 và có kết quả:**

```powershell
curl.exe -i "$api/users?q=demo&status=active" -H "Authorization: Bearer $auditorToken"
```

Mọi bản ghi trả về phải có `status:"active"` và tên hoặc email chứa `demo`.

**T05 — query không hợp lệ, kỳ vọng 400:**

```powershell
curl.exe -i "$api/users?limit=500" -H "Authorization: Bearer $auditorToken"
```

Body có `"code":"INVALID_QUERY_PARAMETER"`.

**T24 — JSON sai cú pháp, kỳ vọng 400:**

```powershell
curl.exe -i -X POST "$api/auth/tokens" -H "Content-Type: application/json" --data-binary "{"
```

Body có `"code":"MALFORMED_JSON"`.

T06–T23 nên chạy qua collection để dùng đúng ID động/token/body và tự động assertions; danh sách request, body và output mong đợi đầy đủ nằm ở các bảng phía trên.

### Lệnh curl.exe cho toàn bộ T01–T24

Các lệnh sau là ví dụ PowerShell chạy theo đúng thứ tự collection. Điền token và ID vào biến ở bộ nhớ, không thay bằng token ghi thẳng vào file. Dùng một email duy nhất cho `$testEmail`; ID cần lấy từ response T06 hoặc các response setup.

```powershell
$api = 'https://web-and-services-rbac.onrender.com/api/v1'
$adminToken = '<admin token>'
$managerToken = '<token manager thử dùng một lần>'
$auditorToken = '<auditor token>'
$memberToken = '<member token>'
$managerUserId = '<ID manager thử dùng một lần>'
$superAdminRoleId = '<ID role super-admin>'
$managerRoleId = '<ID role user-manager>'
$auditorRoleId = '<ID role auditor>'
$memberRoleId = '<ID role member>'
$roleInUseId = '<ID role support-observer>'
$customRoleId = $roleInUseId
$createdUserId = '<ID trả về từ T06>'
$testEmail = 'postman-unique@example.test'
$softDeleteUserId = '<ID member thử dùng một lần cho T17>'
$softDeleteEmail = 'soft-delete-unique@example.test'
$softDeletePassword = '<mật khẩu tạm của user T17>'

function Invoke-Rbac {
  param(
    [Parameter(Mandatory)][string]$Method,
    [Parameter(Mandatory)][string]$Path,
    [string]$Token,
    [object]$Body,
    [string]$RawBody,
    [hashtable]$ExtraHeaders = @{}
  )
  $curlArgs = @('-i', '-sS', '-X', $Method, "$api$Path")
  if ($Token) { $curlArgs += @('-H', "Authorization: Bearer $Token") }
  foreach ($key in $ExtraHeaders.Keys) { $curlArgs += @('-H', "$key`: $($ExtraHeaders[$key])") }
  if ($PSBoundParameters.ContainsKey('Body')) {
    $curlArgs += @('-H', 'Content-Type: application/json', '--data-raw', ($Body | ConvertTo-Json -Depth 10 -Compress))
  } elseif ($PSBoundParameters.ContainsKey('RawBody')) {
    $curlArgs += @('-H', 'Content-Type: application/json', '--data-binary', $RawBody)
  }
  & curl.exe @curlArgs
}

# T01 — expected 401 UNAUTHENTICATED
Invoke-Rbac GET '/users'

# T02 — expected 403 FORBIDDEN
Invoke-Rbac GET '/users' -Token $memberToken

# T03 — expected 200, meta page=2, limit=3
Invoke-Rbac GET '/users?page=2&limit=3&sort=fullName' -Token $auditorToken

# T04 — expected 200 and non-empty matching Demo results
Invoke-Rbac GET '/users?q=demo&status=active' -Token $auditorToken

# T05 — expected 400 INVALID_QUERY_PARAMETER
Invoke-Rbac GET '/users?limit=500' -Token $auditorToken

# T06 — expected 201; copy response id into $createdUserId
Invoke-Rbac POST '/users' -Token $managerToken -Body @{
  email = $testEmail; fullName = 'Postman Created User'; phone = '+84911222333'
  password = 'RbacTest1!'; roleIds = @($memberRoleId)
}

# T07 — expected 409 EMAIL_ALREADY_EXISTS
Invoke-Rbac POST '/users' -Token $managerToken -Body @{
  email = $testEmail; fullName = 'Duplicate User'; password = 'RbacTest1!'
}

# T08 — expected 400, details includes WEAK_PASSWORD
Invoke-Rbac POST '/users' -Token $managerToken -Body @{
  email = "weak-$testEmail"; fullName = 'Weak Password'; password = '123'
}

# T09 — expected 403 PRIVILEGE_ESCALATION
Invoke-Rbac POST '/users' -Token $managerToken -Body @{
  email = "escalation-$testEmail"; fullName = 'Escalation Attempt'
  password = 'RbacTest1!'; roleIds = @($superAdminRoleId)
}

# T10 — expected 200; fullName remains unchanged
Invoke-Rbac PATCH "/users/$createdUserId" -Token $managerToken -Body @{
  phone = '+84911222334'
}

# T11 — expected 400 FIELD_NOT_ALLOWED
Invoke-Rbac PATCH "/users/$createdUserId" -Token $managerToken -Body @{
  roles = @()
}

# T12 — expected 403 SELF_ACTION_FORBIDDEN
Invoke-Rbac PATCH "/users/$managerUserId" -Token $managerToken -Body @{
  status = 'locked'
}

# T13 — run twice; both expected 204
Invoke-Rbac PUT "/users/$createdUserId/roles/$auditorRoleId" -Token $managerToken
Invoke-Rbac PUT "/users/$createdUserId/roles/$auditorRoleId" -Token $managerToken

# T14 — expected 403 PRIVILEGE_ESCALATION
Invoke-Rbac PUT "/users/$createdUserId/roles/$superAdminRoleId" -Token $managerToken

# T16 — run before T15; expected 403 FORBIDDEN while manager role still exists
Invoke-Rbac DELETE "/users/$createdUserId" -Token $managerToken

# T15 — expected 204; then confirm old manager token returns 403
Invoke-Rbac DELETE "/users/$managerUserId/roles/$managerRoleId" -Token $adminToken
Invoke-Rbac GET '/users' -Token $managerToken

# T17 — expected 204, then 404 for GET and 401 INVALID_CREDENTIALS for login
Invoke-Rbac DELETE "/users/$softDeleteUserId" -Token $adminToken
Invoke-Rbac GET "/users/$softDeleteUserId" -Token $adminToken
Invoke-Rbac POST '/auth/tokens' -Body @{
  grantType = 'password'; email = $softDeleteEmail; password = $softDeletePassword
}

# T18 — expected 404 USER_NOT_FOUND
Invoke-Rbac GET '/users/abc' -Token $auditorToken

# T19 — expected 409 ROLE_CODE_EXISTS
Invoke-Rbac POST '/roles' -Token $adminToken -Body @{
  code = 'support-observer'; name = 'Duplicate Role'; permissions = @()
}

# T20 — expected 409 SYSTEM_ROLE_PROTECTED
Invoke-Rbac PUT "/roles/$memberRoleId/permissions" -Token $adminToken -Body @{
  permissions = @()
}

# T21 — expected 409 ROLE_IN_USE
Invoke-Rbac DELETE "/roles/$roleInUseId" -Token $adminToken

# T22 — expected 400 PERMISSION_NOT_FOUND
Invoke-Rbac PUT "/roles/$customRoleId/permissions" -Token $adminToken -Body @{
  permissions = @('users:fly')
}

# T23 — expected 403 FORBIDDEN even with the spoofed header
Invoke-Rbac POST '/users' -Token $memberToken -ExtraHeaders @{
  'X-User-Role' = 'super-admin'
} -Body @{
  email = 'spoofed@example.test'; fullName = 'Spoofed Role'
  password = 'RbacTest1!'; roleIds = @()
}

# T24 — expected 400 MALFORMED_JSON
Invoke-Rbac POST '/auth/tokens' -RawBody '{'
```

For the four login requests in PowerShell, use this pattern; it prints the access token, so do not capture/share the output:

```powershell
$body = @{ grantType = 'password'; email = '<demo email>'; password = '<read locally from .env>' } |
  ConvertTo-Json -Compress
$login = & curl.exe -sS -X POST "$api/auth/tokens" `
  -H 'Content-Type: application/json' --data-raw $body | ConvertFrom-Json
$token = $login.accessToken
```

## 5. Ảnh cần chụp theo đề

PDF đề bài, mục deliverables (trang 42/44), nêu rõ: **“Ảnh chụp giao diện khi đăng nhập bằng 3 vai trò khác nhau.”** Vì vậy, phần ảnh vai trò tối thiểu nên có **3 ảnh khác nhau**:

1. **Super-admin:** sau khi đăng nhập; thấy giao diện quản trị người dùng/vai trò.
2. **User-manager:** thấy màn hình quản lý user nhưng không có thao tác xóa.
3. **Member:** chỉ thấy hồ sơ cá nhân, không có quyền quản trị.

Chụp ba ảnh riêng, không ghép role vào một ảnh:

1. **Super-admin:** vào trang Người dùng hoặc Vai trò; để thấy các chức năng quản trị và nhãn/tên role.
2. **User-manager:** vào trang Người dùng; để thấy thao tác quản lý được phép và không có nút Xóa.
3. **Member:** vào Hồ sơ của tôi; để thấy không có tab quản trị và danh sách quyền trống.

Không cần chụp một ảnh cho mỗi request API. Báo cáo đã ghi bảng kết quả T01–T24 và kết quả HTTP trực tiếp **24/24 PASS**. Không đưa ảnh Atlas/Render, DevTools Network, token, URI hoặc mật khẩu vào báo cáo nếu đề không yêu cầu rõ.

Ba ảnh role đã được cung cấp và chèn vào báo cáo Markdown/Word: `Ex3-RBAC/report/evidence/admin.png`, `manager.png`, và `member.png`. Kết quả HTTP harness 24/24 được ghi riêng với collection Postman; hai hình thức này không được gộp thành một bằng chứng.

Các vị trí S16–S19 trong phần kiểm thử/phân tích gắn với những thí nghiệm riêng của các câu hỏi báo cáo; chúng không phải yêu cầu chụp ảnh cho từng API. Chỉ bổ sung bằng chứng ở đó nếu bạn thực hiện các thí nghiệm/câu hỏi tương ứng hoặc giảng viên yêu cầu.
