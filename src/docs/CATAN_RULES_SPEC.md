# TÀI LIỆU QUY CHUẨN LUẬT CHƠI CATAN (THE SETTLERS OF CATAN SPECIFICATION)

Tài liệu này tổng hợp toàn diện và chính xác 100% luật chơi chuẩn Catan thế giới (Klaus Teuber) dành cho phiên bản cơ bản (Base Game 3-4 người chơi).

---

## 1. THÀNH PHẦN BÀN CỜ VÀ THIẾT LẬP (BOARD & COMPONENTS)

### 1.1 Các ô lục giác (19 Hex Tiles)
- **4 Rừng (Forest / Lumber)**: Cho tài nguyên Gỗ (Wood / Lumber).
- **4 Đồng cỏ (Pasture / Wool)**: Cho tài nguyên Cừu (Sheep / Wool).
- **4 Cánh đồng (Fields / Grain)**: Cho tài nguyên Lúa mì (Wheat / Grain).
- **3 Đồi sét (Hills / Brick)**: Cho tài nguyên Gạch (Brick).
- **3 Mỏ núi (Mountains / Ore)**: Cho tài nguyên Đá / Quặng (Ore).
- **1 Sa mạc (Desert)**: Không sinh tài nguyên, vị trí khởi đầu của Tướng cướp (Robber).

### 1.2 Các con số may mắn (18 Number Tokens)
Gồm các số từ 2 đến 12 (trừ số 7):
- Số **2** (1 chấm - Xác suất 1/36) - 1 thẻ
- Số **3** (2 chấm - Xác suất 2/36) - 2 thẻ
- Số **4** (3 chấm - Xác suất 3/36) - 2 thẻ
- Số **5** (4 chấm - Xác suất 4/36) - 2 thẻ
- Số **6** (5 chấm - Xác suất 5/36, in màu Đỏ nổi bật) - 2 thẻ
- Số **8** (5 chấm - Xác suất 5/36, in màu Đỏ nổi bật) - 2 thẻ
- Số **9** (4 chấm - Xác suất 4/36) - 2 thẻ
- Số **10** (3 chấm - Xác suất 3/36) - 2 thẻ
- Số **11** (2 chấm - Xác suất 2/36) - 2 thẻ
- Số **12** (1 chấm - Xác suất 1/36) - 1 thẻ

### 1.3 Bến cảng (9 Harbors / Ports)
- **4 Cảng 3:1 (Generic Port)**: Đổi 3 tài nguyên bất kỳ cùng loại lấy 1 tài nguyên tuỳ chọn.
- **5 Cảng 2:1 (Specialty Ports)**: 1 Cảng Gỗ (2 Gỗ -> 1 bất kỳ), 1 Cảng Gạch (2 Gạch -> 1 bất kỳ), 1 Cảng Cừu (2 Cừu -> 1 bất kỳ), 1 Cảng Lúa mì (2 Lúa mì -> 1 bất kỳ), 1 Cảng Đá (2 Đá -> 1 bất kỳ).

### 1.4 Bộ quân của mỗi người chơi
- 5 Ngôi làng (Settlement) - Mỗi làng mang lại 1 Điểm Chiến thắng (VP).
- 4 Thành phố (City) - Mỗi thành phố mang lại 2 Điểm Chiến thắng (VP).
- 15 Con đường (Road).

### 1.5 Bộ bài Phát triển (25 Development Cards)
- 14 Thẻ Hiệp sĩ (Knight).
- 5 Thẻ Điểm Chiến thắng (Victory Point: Chapel, Great Hall, Library, Market, University).
- 2 Thẻ Xây dựng đường (Road Building): Đặt ngay 2 con đường miễn phí.
- 2 Thẻ Năm bội thu (Year of Plenty): Chọn và lấy ngay 2 thẻ tài nguyên bất kỳ từ ngân hàng.
- 2 Thẻ Độc quyền (Monopoly): Tuyên bố 1 loại tài nguyên, tất cả người chơi khác phải giao nộp toàn bộ tài nguyên đó cho bạn.

---

## 2. GIAI ĐOẠN THIẾT LẬP BAN ĐẦU (INITIAL SETUP / SNAKE DRAFT)

1. **Thứ tự đi**:
   - Vòng 1: Người chơi 1 -> 2 -> 3 -> 4. Mỗi người đặt **1 Làng** và **1 Con đường** xuất phát từ làng đó.
   - Vòng 2: Người chơi 4 -> 3 -> 2 -> 1 (thứ tự ngược lại). Mỗi người đặt tiếp **1 Làng thứ hai** và **1 Con đường** xuất phát từ làng thứ hai.
2. **Quy tắc Khoảng cách (Distance Rule)**:
   - Một Làng chỉ được xây dựng tại đỉnh ngã 3 (hoặc ngã 2 ven biển) sao cho **tất cả 3 đỉnh kề cận (cách 1 cạnh) đều KHÔNG có bất kỳ Làng hay Thành phố nào của bất kỳ người chơi nào**.
3. **Tài nguyên khởi đầu**:
   - Ngay sau khi đặt Làng thứ hai, người chơi nhận 1 thẻ tài nguyên tương ứng với mỗi ô lục giác bao quanh ngôi Làng thứ hai đó (tối đa 3 tài nguyên).

---

## 3. TIẾN TRÌNH LƯỢT CHƠI CHÍNH (REGULAR TURN CYCLE)

Mỗi lượt của người chơi bao gồm các giai đoạn tuần tự:

### 3.1 Giai đoạn Đổ xúc xắc (Dice Roll Phase)
Người chơi đến lượt lắc 2 viên xúc xắc:
- **Nếu tổng điểm $\neq 7$**:
  - Tất cả các ô có số tương ứng sinh tài nguyên.
  - Người chơi sở hữu Làng cạnh ô đó nhận **1 tài nguyên**.
  - Người chơi sở hữu Thành phố cạnh ô đó nhận **2 tài nguyên**.
  - *Lưu ý*: Ô đang bị Tướng cướp (Robber) đứng sẽ **bị vô hiệu hoá hoàn toàn**, không ai nhận được tài nguyên từ ô này.

- **Nếu tổng điểm $= 7$ (Kích hoạt Tướng cướp)**:
  1. **Xả bài (Discard Cards)**: Tất cả người chơi đang cầm **nhiều hơn 7 thẻ tài nguyên** (từ 8 thẻ trở lên) phải chọn bỏ đi một nửa số thẻ (làm tròn xuống, ví dụ 9 thẻ bỏ 4 thẻ, 8 thẻ bỏ 4 thẻ).
  2. **Di chuyển Robber (Move Robber)**: Người vừa đổ 7 phải di chuyển Robber sang 1 ô lục giác khác (bắt buộc phải rời ô hiện tại).
  3. **Cướp tài nguyên (Steal Resource)**: Nếu tại ô mới có Làng/Thành phố của 1 hoặc nhiều người chơi khác, người đổ 7 được chọn 1 nạn nhân và cướp ngẫu nhiên 1 lá tài nguyên từ tay nạn nhân đó.

### 3.2 Giai đoạn Giao thương (Trade Phase)
Người có lượt có thể thực hiện giao thương không giới hạn:
1. **Giao thương Nội bộ (Domestic Trade / Player-to-Player)**:
   - Người có lượt đưa ra đề nghị (Ví dụ: "Đổi 1 Gỗ lấy 1 Lúa mì").
   - Những người khác có thể đồng ý giao dịch hoặc đưa ra đề xuất đối ứng.
   - Chỉ người đang có lượt mới được giao dịch với người khác (hai người không có lượt không được tự ý đổi cho nhau).
2. **Giao thương Hàng hải & Ngân hàng (Maritime Trade)**:
   - **Tỉ lệ mặc định (Bank 4:1)**: Đổi 4 tài nguyên cùng loại lấy 1 tài nguyên bất kỳ.
   - **Cảng đa năng (General Port 3:1)**: Đổi 3 tài nguyên cùng loại lấy 1 tài nguyên bất kỳ (khi có Làng/Thành phố ở bến cảng 3:1).
   - **Cảng chuyên dụng (Special Port 2:1)**: Đổi 2 tài nguyên đúng loại quy định lấy 1 tài nguyên bất kỳ (khi có Làng/Thành phố ở bến cảng tương ứng).

### 3.3 Giai đoạn Xây dựng & Mua sắm (Build Phase)
Người chơi có thể xây dựng bao nhiêu tuỳ thích nếu đủ tài nguyên trong kho:
- **Đường đi (Road)**: `1 Gỗ + 1 Gạch`
  - Phải nối liền với con đường hoặc Làng/Thành phố hiện có của chính mình.
- **Làng (Settlement)**: `1 Gỗ + 1 Gạch + 1 Lúa mì + 1 Cừu`
  - Phải nối với đường của mình và tuân thủ tuyệt đối **Quy tắc Khoảng cách (Distance Rule)**.
  - Cho **1 Điểm Chiến thắng (VP)**.
- **Thành phố (City)**: `2 Lúa mì + 3 Đá`
  - Nâng cấp trực tiếp từ 1 Làng hiện có trên bàn cờ.
  - Cho **2 Điểm Chiến thắng (VP)** (thay thế 1 điểm của làng trước đó).
  - Thu hoạch **gấp đôi tài nguyên (2 thẻ)** mỗi khi ô kề cận được đổ ra số trúng.
- **Mua Thẻ Phát triển (Development Card)**: `1 Lúa mì + 1 Cừu + 1 Đá`
  - Rút ngẫu nhiên 1 lá từ cọc bài phát triển.

### 3.4 Quy tắc Sử dụng Thẻ Phát triển (Dev Cards Rules)
- **Thời điểm**: Có thể đánh thẻ phát triển ở bất kỳ lúc nào trong lượt của mình (ngay cả trước khi đổ xúc xắc).
- **Giới hạn**: Chỉ được đánh tối đa **1 thẻ phát triển trong 1 lượt**.
- **Quy tắc mua**: Không được đánh thẻ phát triển vừa mua trong cùng lượt đó (trừ trường hợp thẻ Điểm Chiến thắng giúp bạn đạt đủ 10 điểm để thắng ngay lập tức).
- **Hiệp sĩ (Knight)**: Cho phép di chuyển Tướng cướp và cướp 1 thẻ như khi đổ ra 7. Thẻ Hiệp sĩ sau khi dùng sẽ lật ngửa trước mặt người chơi.

---

## 4. DANH HIỆU ĐẶC BIỆT & ĐIỀU KIỆN CHIẾN THẮNG

### 4.1 Con đường Dài nhất (Longest Road - 2 VP)
- Trao cho người chơi đầu tiên đạt được chuỗi đường liên tục không đứt đoạn dài **tối thiểu 5 đoạn**.
- Nếu có người chơi khác tạo được chuỗi đường dài hơn người đang giữ danh hiệu, thẻ Longest Road lập tức chuyển sang người đó.
- *Lưu ý*: Chuỗi đường bị tính là đứt đoạn nếu bị chặn bởi Làng/Thành phố của đối thủ nằm tại giao điểm giữa các đoạn đường.

### 4.2 Đội quân Lớn nhất (Largest Army - 2 VP)
- Trao cho người chơi đầu tiên lật ngửa được **tối thiểu 3 thẻ Hiệp sĩ (Knight)**.
- Nếu có người chơi khác lật được nhiều thẻ Hiệp sĩ hơn người đang giữ danh hiệu, thẻ Largest Army lập tức chuyển sang người đó.

### 4.3 Cách tính Điểm Chiến thắng (Victory Points)
- 1 Làng = 1 VP
- 1 Thành phố = 2 VP
- Thẻ Danh hiệu Con đường dài nhất = 2 VP
- Thẻ Danh hiệu Đội quân lớn nhất = 2 VP
- Thẻ Điểm Chiến thắng (Victory Point Card) = 1 VP / thẻ (được giữ bí mật đến cuối game).

### 4.4 Điều kiện Kết thúc Game
- Người chơi nào đạt **từ 10 Điểm Chiến thắng trở lên trong lượt của mình** sẽ tuyên bố chiến thắng và kết thúc ván đấu!
