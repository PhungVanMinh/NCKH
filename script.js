// NỘI DUNG FILE GỐC script - Copy (2).txt VỚI CÁC SỬA ĐỔI TỐI THIỂU

let currentVariables = {}; // Object để lưu trạng thái các biến: { tenBien: BienObject, ... }
document.addEventListener('DOMContentLoaded', () => {
    // --- Dữ liệu mẫu (Thay vì đọc file JSON) ---
    const loaiDuLieuData = [
      { Ten: "int", MoTa: "Kiểu số nguyên", DanhSachRangBuocCoThe: ["GiaTriLonNhat", "GiaTriNhoNhat"] },
      { Ten: "double", MoTa: "Kiểu số thực dấu phẩy động", DanhSachRangBuocCoThe: ["GiaTriLonNhat", "GiaTriNhoNhat"] },
      { Ten: "char", MoTa: "Kiểu ký tự đơn", DanhSachRangBuocCoThe: ["KhongChuaChuHoa", "KhongChuaChuThuong", "KhongChuaCacKyTuDacBiet"] },
      { Ten: "string", MoTa: "Kiểu chuỗi ký tự", DanhSachRangBuocCoThe: ["KhongChuaChuHoa", "KhongChuaChuThuong", "KhongChuaCacKyTuDacBiet"] },
      { Ten: "array", MoTa: "Kiểu mảng (danh sách)", DanhSachRangBuocCoThe: [], SoLuong: null, KieuPhanTu: null },
      { Ten: "record", MoTa: "Kiểu bản ghi (cấu trúc)", DanhSachRangBuocCoThe: [], DanhSachThanhVien: [] }
    ];

    const rangBuocData = [
      { Ten: "GiaTriLonNhat", GiaTri: 100, MoTa: "Không lớn hơn giá trị này", LoaiDuLieuApDung: ["int", "double"] },
      { Ten: "GiaTriNhoNhat", GiaTri: 0, MoTa: "Không nhỏ hơn giá trị này", LoaiDuLieuApDung: ["int", "double"] },
      { Ten: "KhongChuaChuHoa", GiaTri: 1, MoTa: "Không chứa chữ hoa (A-Z)", LoaiDuLieuApDung: ["char", "string"] },
      { Ten: "KhongChuaChuThuong", GiaTri: 1, MoTa: "Không chứa chữ thường (a-z)", LoaiDuLieuApDung: ["char", "string"] },
      { Ten: "KhongChuaCacKyTuDacBiet", GiaTri: 1, MoTa: "Không chứa ký tự đặc biệt (!@#...)", LoaiDuLieuApDung: ["char", "string"] }
    ];
// --- Trạng thái ứng dụng ---


    // --- Lấy các phần tử DOM ---
    const variableInput = document.getElementById('variableInput');
    const variablesListContainer = document.getElementById('variablesList');
    const showJsonButton = document.getElementById('showJsonButton');
    const outputJsonContainer = document.getElementById('outputJson');
// --- Templates ---
    const variableTemplate = document.getElementById('variable-template');
    const arrayConfigTemplate = document.getElementById('array-config-template');
    const recordConfigTemplate = document.getElementById('record-config-template');
    const constraintTemplate = document.getElementById('constraint-template');

    // --- Hàm Hilfsfunktionen ---

    // Lấy thông tin LoaiDuLieu theo tên
    function getLoaiDuLieuByName(name) {
        // Trả về bản sao sâu để tránh thay đổi dữ liệu gốc
        const found = loaiDuLieuData.find(ld => ld.Ten === name);
        return found ? JSON.parse(JSON.stringify(found)) : null;
    }

    // Lấy thông tin RangBuoc theo tên
    function getRangBuocByName(name) {
         const found = rangBuocData.find(rb => rb.Ten === name);
        return found ? JSON.parse(JSON.stringify(found)) : null;
    }



    // --- Hàm Render Giao Diện ---

    // Render toàn bộ danh sách biến
    function renderVariablesList() {
        variablesListContainer.innerHTML = '';
// Xóa nội dung cũ
        const variableNames = variableInput.value.split(/[\s\n]+/).filter(name => name.trim() !== '');
        const newVariablesState = {}; // Chỉ chứa các biến top-level
        let activeRecordMembersList = null;
// Tham chiếu đến DanhSachThanhVien của record đang hoạt động
        let currentTopLevelRecordBien = null;
// Tham chiếu đến Bien record cấp cao nhất đang hoạt động

        variableNames.forEach(name => {
            // --- Xác định xem tên này có phải là bắt đầu một record mới không ---
            // (Ví dụ đơn giản: chỉ dựa vào tên 't' hoặc nếu kiểu đã được set là record)
            let isPotentiallyNewRecord = (name === 't');

            let existingBien = currentVariables[name]; // Kiểm tra trạng thái cũ (quan trọng để giữ cấu hình)
            if (existingBien && existingBien.LoaiDuLieu.Ten === 'record') {
                isPotentiallyNewRecord = true;
            }

            // --- Xử lý dựa trên trạng thái activeRecordMembersList ---

            if (activeRecordMembersList !== null && currentTopLevelRecordBien) {
                // Đang ở trong context của một record (thêm thành viên)

                if (isPotentiallyNewRecord && name !== currentTopLevelRecordBien.TenBien) {
                     // Nếu gặp một record mới (KHÁC record hiện tại), dừng thêm vào record cũ

                     activeRecordMembersList = null;
                     currentTopLevelRecordBien = null;
// Rơi xuống xử lý như biến top-level bình thường (bên dưới)
                } else {
                     // Thêm 'name' làm thành viên cho activeRecordMembersList
                     // Kiểm tra xem thành viên đã tồn tại trong list chưa (từ lần chạy trước)

                    const existingMemberIndex = activeRecordMembersList.findIndex(m => m.TenBien === name);
                    if (existingMemberIndex === -1) { // Chỉ thêm nếu chưa có
                        console.log(`Thêm "${name}" vào record "${currentTopLevelRecordBien.TenBien}"`);
                        // Tạo Bien cho thành viên, cố gắng suy đoán kiểu
                        const memberBien = createDefaultBienForMember(name); // <-- Hàm này chưa được định nghĩa trong file gốc? Giả sử nó giống createDefaultBien
                        // const memberBien = createDefaultBien(name); // Tạm dùng hàm này
                        if (memberBien) { // Kiểm tra null phòng trường hợp lỗi
                           activeRecordMembersList.push(memberBien);
                        }
                    } else {
                         // Nếu thành viên đã tồn tại (ví dụ từ currentVariables), ta không cần làm gì ở đây
                         // vì nó đã nằm trong activeRecordMembersList khi lấy từ currentTopLevelRecordBien

                        console.log(`Thành viên "${name}" đã tồn tại trong record "${currentTopLevelRecordBien.TenBien}"`);
                    }
                     // QUAN TRỌNG: Không thêm 'name' vào newVariablesState vì nó là thành viên
                     return;
// Xử lý xong cho tên biến này, chuyển sang tên tiếp theo
                }
            }

            // --- Xử lý như một biến top-level ---
            // (Hoặc record mới bắt đầu từ đây)
            let bienData = existingBien;
// Lấy trạng thái cũ nếu có

            if (!bienData) { // Nếu chưa có trong state cũ, tạo mới
                 bienData = createDefaultBien(name);
// Hàm này tự động nhận diện 't' là record
            }

             if (bienData) {
                newVariablesState[name] = bienData;
// Thêm vào danh sách biến top-level

                // Nếu biến này là record, chuẩn bị để thêm các biến tiếp theo làm thành viên
                if (bienData.LoaiDuLieu.Ten === 'record') {
                    // Đảm bảo DanhSachThanhVien là một mảng

                    if (!Array.isArray(bienData.LoaiDuLieu.DanhSachThanhVien)) {
                         bienData.LoaiDuLieu.DanhSachThanhVien = [];
                    }
                     activeRecordMembersList = bienData.LoaiDuLieu.DanhSachThanhVien;
// Đặt record này làm mục tiêu
                     currentTopLevelRecordBien = bienData;
// Lưu lại biến record cha
                     console.log(`Bắt đầu record "${name}", chuẩn bị thêm thành viên...`);
                 } else {
                    // Nếu không phải record, đảm bảo dừng thêm thành viên vào record trước đó (nếu có)
                    activeRecordMembersList = null;
                    currentTopLevelRecordBien = null;
                }
            }
        });
// Cập nhật trạng thái chính (bao gồm cả các thay đổi trong DanhSachThanhVien)
        currentVariables = newVariablesState;
// --- Render các biến top-level ---
        Object.values(currentVariables).forEach(bienData => {
            const variableElement = renderVariableItem(bienData); // Path sẽ được tạo bên trong hàm này nếu cần
            variablesListContainer.appendChild(variableElement);
        });
        updateAvailableIntVariables(); // Cập nhật lại các biến int cho dropdown Số lượng

        const numFiles = parseInt(numFilesInput.value);
                
        const resultTextinline = generateValuesFromVariables(currentVariables);
        outputValues.textContent = resultTextinline;
    }



    // Cần đảm bảo hàm createDefaultBien cũng xử lý đúng kiểu record ban đầu
     function createDefaultBien(tenBien) {
        let defaultType = 'int';
// Mặc định chung
        // Tự động nhận diện kiểu top-level
        if (['m', 'n'].includes(tenBien)) defaultType = 'int';
        else if (tenBien === 'ch') defaultType = 'char';
        else if (['a', 'b'].includes(tenBien)) defaultType = 'array';
        else if (tenBien === 't') defaultType = 'record'; // Nhận diện 't' là record

        const loaiDuLieu = getLoaiDuLieuByName(defaultType);
        if (!loaiDuLieu) {
             console.error(`Không tìm thấy loại dữ liệu mặc định: ${defaultType} cho biến ${tenBien}`);
            return null;
        }

        // Khởi tạo cấu trúc con nếu là array/record *ở cấp top-level*
        if (loaiDuLieu.Ten === 'array') {
            loaiDuLieu.SoLuong = ''; // *** GỐC: 1 -> SỬA THÀNH '' ***
            loaiDuLieu.KieuPhanTu = getLoaiDuLieuByName('int');
        } else if (loaiDuLieu.Ten === 'record') {
            loaiDuLieu.DanhSachThanhVien = [];
        }


        return {
            TenBien: tenBien,
            LoaiDuLieu: loaiDuLieu,
            DanhSachRangBuoc: []
        };
    }

    // Hàm tạo default cho member (Nếu chưa có, tạm dùng createDefaultBien)
    function createDefaultBienForMember(memberName) {
        console.warn("Hàm createDefaultBienForMember chưa được định nghĩa đầy đủ, đang dùng createDefaultBien.");
        return createDefaultBien(memberName);
    }


    // Render toàn bộ danh sách biến (hàm này có vẻ bị trùng lặp trong file gốc, giữ lại hàm có vẻ hoàn thiện hơn)
    // function renderVariablesList() { ... } // Bỏ qua hàm trùng lặp phía trên


    // Hàm tìm record cha của một thành viên (giữ nguyên từ file gốc)
    function findParentRecordOfMemberInState(memberName, state) {
        for (const topLevelVar of Object.values(state)) {
            if (topLevelVar.LoaiDuLieu.Ten === 'record' && Array.isArray(topLevelVar.LoaiDuLieu.DanhSachThanhVien)) {
                // Kiểm tra trực tiếp
                if (topLevelVar.LoaiDuLieu.DanhSachThanhVien.some(member => member.TenBien === memberName)) {
                    return topLevelVar;
                }
                // Kiểm tra đệ quy trong các thành viên là record
                for (const member of topLevelVar.LoaiDuLieu.DanhSachThanhVien) {
                     if(member.LoaiDuLieu.Ten === 'record') {
                         const parent = findParentRecordOfMemberInState(memberName, { [member.TenBien]: member }); // Tạo state tạm chỉ chứa member record để đệ quy
                         if(parent) return parent;
                     }
                }
            }
            // Kiểm tra đệ quy trong KieuPhanTu của Array nếu là record
            if (topLevelVar.LoaiDuLieu.Ten === 'array' && topLevelVar.LoaiDuLieu.KieuPhanTu && topLevelVar.LoaiDuLieu.KieuPhanTu.Ten === 'record') {
                 const parent = findParentRecordOfMemberInState(memberName, { '[KieuPhanTu]': { LoaiDuLieu: topLevelVar.LoaiDuLieu.KieuPhanTu } });
                 if(parent) return parent;
            }

        }
        return null;
    }

    // Hàm tìm kiếm Bien/LoaiDuLieu trong state bằng path (giữ nguyên)
    function findBienByPath(path) {
        let current = currentVariables;
        for (let i = 0; i < path.length; i++) {
            const segment = path[i];
            if (i === 0) { // Segment đầu tiên là tên biến chính
                if (!current[segment]) return null;
                if(path.length === 1) return current[segment]; // Trả về chính biến đó nếu path chỉ có 1 phần
                current = current[segment];
            } else if (segment === 'KieuPhanTu') {
                 if (!current.LoaiDuLieu || !current.LoaiDuLieu.KieuPhanTu) return null;
                 // Cần trả về cấu trúc Bien chứa LoaiDuLieu này nếu là cuối path
                 if(i === path.length - 1) {
                      // Tạo cấu trúc giả Bien chứa LoaiDuLieu
                      return { TenBien: '[Kiểu Phần Tử]', LoaiDuLieu: current.LoaiDuLieu.KieuPhanTu, DanhSachRangBuoc: [] };
                 }
                 // Đi sâu vào KieuPhanTu để chuẩn bị cho segment tiếp theo
                 current = { TenBien: '[Kiểu Phần Tử]', LoaiDuLieu: current.LoaiDuLieu.KieuPhanTu, DanhSachRangBuoc: [] }; // Bọc lại
            } else if (segment === 'DanhSachThanhVien') {
                if (!current.LoaiDuLieu || !Array.isArray(current.LoaiDuLieu.DanhSachThanhVien)) return null;
                current = current.LoaiDuLieu.DanhSachThanhVien; // Đi vào mảng thành viên
            } else if (typeof segment === 'number' && Array.isArray(current)) { // Segment là index của thành viên record
                if (!current[segment]) return null;
                if(i === path.length - 1) return current[segment]; // Trả về thành viên nếu là cuối path
                current = current[segment]; // Đi vào thành viên cụ thể (đây là một đối tượng Bien)
            } else {
                 return null; // Path không hợp lệ
            }
             // Nếu current không phải object thì dừng lại
             if(typeof current !== 'object' || current === null) return null;
        }
        // Trường hợp path không hợp lệ hoặc không tìm thấy
        return (typeof current === 'object' && current !== null && current.TenBien) ? current : null;
    }

     function findLoaiDuLieuByPath(path) {
         let current = currentVariables;
         let targetLoaiDuLieu = null; // Lưu LoaiDuLieu tìm được

         for (let i = 0; i < path.length; i++) {
              const segment = path[i];
              if (i === 0) {
                  if (!current[segment] || !current[segment].LoaiDuLieu) return null;
                  targetLoaiDuLieu = current[segment].LoaiDuLieu; // Lấy LoaiDuLieu của biến gốc
                  current = current[segment]; // Cập nhật current để duyệt tiếp nếu cần
              } else if (segment === 'KieuPhanTu') {
                   if (!targetLoaiDuLieu || !targetLoaiDuLieu.KieuPhanTu) return null;
                   targetLoaiDuLieu = targetLoaiDuLieu.KieuPhanTu; // Đi vào kiểu phần tử
                   // Cập nhật current để khớp cấu trúc nếu cần đi sâu hơn nữa
                   current = { LoaiDuLieu: targetLoaiDuLieu }; // Cấu trúc tạm
              } else if (segment === 'DanhSachThanhVien') {
                  if (!targetLoaiDuLieu || !Array.isArray(targetLoaiDuLieu.DanhSachThanhVien)) return null;
                  // Nếu segment tiếp theo là index, ta cần lấy LoaiDuLieu của member đó
                  const nextSegment = path[i + 1];
                  if (typeof nextSegment === 'number') {
                      if(!targetLoaiDuLieu.DanhSachThanhVien[nextSegment] || !targetLoaiDuLieu.DanhSachThanhVien[nextSegment].LoaiDuLieu) return null;
                      targetLoaiDuLieu = targetLoaiDuLieu.DanhSachThanhVien[nextSegment].LoaiDuLieu;
                      current = targetLoaiDuLieu.DanhSachThanhVien[nextSegment]; // Cập nhật current là member đó
                       i++; // Bỏ qua index vì đã xử lý
                  } else {
                       return null; // Path không hợp lệ sau DanhSachThanhVien
                  }
              } else {
                  return null; // Path không hợp lệ
              }
               if(typeof targetLoaiDuLieu !== 'object' || targetLoaiDuLieu === null) return null;
         }
         return (typeof targetLoaiDuLieu === 'object' && targetLoaiDuLieu !== null && targetLoaiDuLieu.Ten) ? targetLoaiDuLieu : null; // Chỉ trả về LoaiDuLieu hợp lệ
     }

     // Populate dropdown số lượng (giữ nguyên)
     function populateSoLuongOptions(selectElement, currentValue) {
         // Xóa các option cũ trừ các option đặc biệt
          const optionsToKeep = Array.from(selectElement.options).filter(opt => opt.value === '' || opt.value === '__custom__');
         selectElement.innerHTML = '';

          // Thêm lại các option đặc biệt
          optionsToKeep.forEach(opt => selectElement.appendChild(opt.cloneNode(true)));
         if (!optionsToKeep.some(opt => opt.value === '')) { // Đảm bảo có option mặc định
               const defaultOption = document.createElement('option');
               defaultOption.value = '';
               defaultOption.textContent = '--- Chọn biến int ---';
               selectElement.insertBefore(defaultOption, selectElement.firstChild);
           }
           if (!optionsToKeep.some(opt => opt.value === '__custom__')) { // Đảm bảo có option nhập tay
                const customOption = document.createElement('option');
                customOption.value = '__custom__';
                customOption.textContent = 'Nhập giá trị...';
                selectElement.appendChild(customOption);
           }


          // Lấy danh sách biến int hiện tại
         const intVariableNames = Object.values(currentVariables)
                                       .filter(bien => bien.LoaiDuLieu && bien.LoaiDuLieu.Ten === 'int')
                                       .map(bien => bien.TenBien);
         // Thêm các biến int
         intVariableNames.forEach(name => {
             const option = document.createElement('option');
             option.value = name;
             option.textContent = name;
             selectElement.appendChild(option);
         });
         // Set giá trị đã chọn trước đó
         if (typeof currentValue === 'number') {
             selectElement.value = '__custom__';
         } else if (intVariableNames.includes(currentValue) || currentValue === '') {
             selectElement.value = currentValue;
         } else {
              selectElement.value = ''; // Nếu biến tham chiếu không còn, reset
         }
     }

     // Cập nhật dropdown số lượng (giữ nguyên)
    function updateAvailableIntVariables() {
        const intVariableNames = Object.values(currentVariables)
                                     .filter(bien => bien.LoaiDuLieu && bien.LoaiDuLieu.Ten === 'int')
                                     .map(bien => bien.TenBien);
        document.querySelectorAll('.array-so-luong-select').forEach(select => {
            const currentSelection = select.value; // Lưu lại lựa chọn hiện tại
            // Giữ lại option 'Chọn biến...' và 'Nhập giá trị...'
             const optionsToKeep = Array.from(select.options).filter(opt => opt.value === '' || opt.value === '__custom__');
            select.innerHTML = ''; // Xóa các option cũ (trừ các option đặc biệt)


            // Thêm lại các option đặc biệt
             optionsToKeep.forEach(opt => select.appendChild(opt.cloneNode(true)));
             if (!optionsToKeep.some(opt => opt.value === '')) { // Đảm bảo có option mặc định
                 const defaultOption = document.createElement('option');
                 defaultOption.value = '';
                 defaultOption.textContent = '--- Chọn biến int ---';
                 select.insertBefore(defaultOption, select.firstChild); // Thêm vào đầu
             }
              if (!optionsToKeep.some(opt => opt.value === '__custom__')) { // Đảm bảo có option nhập tay
                  const customOption = document.createElement('option');
                  customOption.value = '__custom__';
                  customOption.textContent = 'Nhập giá trị...';
                  select.appendChild(customOption);
             }


            // Thêm các biến int vào dropdown
            intVariableNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                 select.appendChild(option);
            });
            // Khôi phục lựa chọn cũ nếu còn hợp lệ
             if (intVariableNames.includes(currentSelection) || currentSelection === '__custom__' || currentSelection === '') {
                 select.value = currentSelection;
             } else {
                  // Nếu biến int cũ không còn tồn tại, kiểm tra xem có đang nhập số không
                  const variableItem = select.closest('.variable-item');
                  if(variableItem && variableItem.dataset.variablePath){ // Thêm kiểm tra dataset
                       try { // Thêm try-catch
                           const dataPath = JSON.parse(variableItem.dataset.variablePath);
                           const targetBien = findBienByPath(dataPath); // Tìm biến để kiểm tra SoLuong
                           if(targetBien && targetBien.LoaiDuLieu.Ten === 'array' && typeof targetBien.LoaiDuLieu.SoLuong === 'number'){
                                select.value = '__custom__'; // Vẫn là nhập tay
                           } else {
                                select.value = ''; // Reset về mặc định nếu biến tham chiếu bị xóa
                                // Cũng cần cập nhật SoLuong trong state về một giá trị mặc định nếu biến tham chiếu mất
                               if(targetBien && targetBien.LoaiDuLieu.Ten === 'array'){
                                   targetBien.LoaiDuLieu.SoLuong = ''; // Reset về '' khi biến tham chiếu mất
                                   const inputSibling = select.nextElementSibling;
                                   if(inputSibling && inputSibling.classList.contains('array-so-luong-input')){
                                       inputSibling.style.display = 'none'; // Ẩn input nếu không còn là custom
                                   }
                               }
                           }
                       } catch(e) {
                            console.error("Lỗi khi xử lý path trong updateAvailableIntVariables:", e);
                            select.value = ''; // Fallback nếu lỗi
                       }
                   } else {
                       select.value = ''; // Fallback
                  }
             }

        });
    }


    // Render một mục biến (giữ nguyên renderVariableItem từ file gốc)
    function renderVariableItem(bienData, isMember = false, path = []) {
        const templateNode = variableTemplate.content.cloneNode(true);
        const variableItem = templateNode.querySelector('.variable-item');
        const nameElement = variableItem.querySelector('.variable-name');
        const loaiDuLieuSelect = variableItem.querySelector('.loai-du-lieu-select');
        const specificConfigContainer = variableItem.querySelector('.specific-config');
        const constraintsListContainer = variableItem.querySelector('.constraints-list');
        const configOptionsDiv = variableItem.querySelector('.config-options'); // Lấy div cha của các config

        // ** QUAN TRỌNG: Xác định path cho mục này **
        // Nếu path rỗng (gọi từ renderVariablesList cho top-level), path gốc là [tenBien]
        // Nếu path không rỗng (gọi đệ quy), giữ nguyên path đó
        const currentPath = path.length > 0 ? path : [bienData.TenBien];
        variableItem.dataset.variablePath = JSON.stringify(currentPath); // Lưu path vào dataset

        nameElement.textContent = bienData.TenBien;

        if (isMember) {
            variableItem.style.fontSize = '0.9em';
            variableItem.style.borderColor = '#eee';
            variableItem.style.marginLeft = '20px'; // Thụt lề cho member

            // Thêm nút Promote (Logic Promote chưa hoàn chỉnh)
            const promoteButton = document.createElement('button');
            promoteButton.innerHTML = '&#x2191;'; // Mũi tên lên unicode
            promoteButton.title = 'Đưa lên cấp trên';
            promoteButton.classList.add('promote-button', 'action-button');
            promoteButton.style.marginLeft = '10px';
            promoteButton.style.padding = '2px 6px';
            promoteButton.style.lineHeight = '1';

            promoteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Logic promote cần xem lại cẩn thận, tạm comment out
                // promoteMemberToTopLevel(currentPath);
                alert('Chức năng Promote đang được phát triển!');
            });
            nameElement.insertAdjacentElement('afterend', promoteButton);

        } else {
            // Nút xóa cho top-level (chưa có logic)
            // const deleteButton = ...
            // nameElement.insertAdjacentElement('afterend', deleteButton);
        }


        // -- Populate Loại Dữ Liệu Select --
        loaiDuLieuSelect.innerHTML = '';
        loaiDuLieuData.forEach(ld => {
            const option = document.createElement('option');
            option.value = ld.Ten;
            option.textContent = ld.Ten;
            if (bienData.LoaiDuLieu && bienData.LoaiDuLieu.Ten === ld.Ten) {
                option.selected = true;
            }
            loaiDuLieuSelect.appendChild(option);
        });
        // -- Event Listener cho Loại Dữ Liệu Select --
        loaiDuLieuSelect.addEventListener('change', (e) => {
            const newTypeName = e.target.value;
            // Lấy path từ dataset
            const dataPath = JSON.parse(variableItem.dataset.variablePath);
            // Tìm đúng đối tượng Bien cần cập nhật dùng path
            let targetBien = findBienByPath(dataPath);

            if(targetBien) {
                const newLoaiDuLieuData = getLoaiDuLieuByName(newTypeName);
                if(!newLoaiDuLieuData) return;

                // --- CẬP NHẬT LOẠI DỮ LIỆU ---
                targetBien.LoaiDuLieu = newLoaiDuLieuData; // Gán object mới

                // --- Khởi tạo cấu trúc con & Reset ràng buộc ---
                targetBien.DanhSachRangBuoc = [];
                if (newLoaiDuLieuData.Ten === 'array') {
                     if(targetBien.LoaiDuLieu.SoLuong === null) targetBien.LoaiDuLieu.SoLuong = ''; // Default SoLuong
                    if(!targetBien.LoaiDuLieu.KieuPhanTu) targetBien.LoaiDuLieu.KieuPhanTu = getLoaiDuLieuByName('int');
                    delete targetBien.LoaiDuLieu.DanhSachThanhVien; // Xóa thuộc tính record cũ
                } else if (newLoaiDuLieuData.Ten === 'record') {
                     if(!targetBien.LoaiDuLieu.DanhSachThanhVien) targetBien.LoaiDuLieu.DanhSachThanhVien = [];
                    delete targetBien.LoaiDuLieu.SoLuong; // Xóa thuộc tính array cũ
                    delete targetBien.LoaiDuLieu.KieuPhanTu;
                } else {
                    delete targetBien.LoaiDuLieu.SoLuong;
                    delete targetBien.LoaiDuLieu.KieuPhanTu;
                    delete targetBien.LoaiDuLieu.DanhSachThanhVien;
                }

                // Render lại phần cấu hình và ràng buộc cho mục này
                // Quan trọng: Truyền path đúng vào các hàm render con
                renderSpecificConfig(targetBien.LoaiDuLieu, specificConfigContainer, dataPath);
                renderConstraints(targetBien, constraintsListContainer, dataPath);
                updateAvailableIntVariables();
             } else {
                 console.error("Không tìm thấy biến/loại dữ liệu để cập nhật:", dataPath);
             }
        });

        // -- Render Cấu Hình Riêng (Array/Record) --
        // Truyền LoaiDuLieu và path của nó
        renderSpecificConfig(bienData.LoaiDuLieu, specificConfigContainer, currentPath);
        // -- Render Ràng Buộc --
        // Truyền Bien và path của nó
        renderConstraints(bienData, constraintsListContainer, currentPath);


        return variableItem;
    }

    // Render cấu hình riêng cho Array hoặc Record (HÀM NÀY SẼ ĐƯỢC SỬA)
    function renderSpecificConfig(loaiDuLieu, container, parentPath) { // parentPath là path đến loaiDuLieu này
         container.innerHTML = '';
         if (loaiDuLieu.Ten === 'array') {
             const arrayConfigNode = arrayConfigTemplate.content.cloneNode(true);
            const soLuongSelect = arrayConfigNode.querySelector('.array-so-luong-select');
             const soLuongInput = arrayConfigNode.querySelector('.array-so-luong-input');
             const kieuPhanTuContainer = arrayConfigNode.querySelector('.array-kieu-phan-tu-container');

             populateSoLuongOptions(soLuongSelect, loaiDuLieu.SoLuong);
             // Xử lý hiển thị input hoặc select cho số lượng
             if(typeof loaiDuLieu.SoLuong === 'number') {
                 soLuongInput.value = loaiDuLieu.SoLuong;
                 soLuongInput.style.display = 'inline-block';
                 soLuongSelect.value = '__custom__'; // Chọn option tùy chỉnh
             } else {
                  soLuongInput.style.display = 'none';
                  // Giá trị select được đặt trong populateSoLuongOptions
             }


             // Event listener cho Số Lượng Select
             soLuongSelect.addEventListener('change', (e) => {
                 const selectedValue = e.target.value;
                 // *** SỬA CHỖ NÀY: Dùng parentPath thay vì lấy từ DOM ***
                 const dataPath = parentPath;
                 // *** SỬA CHỖ NÀY: Tìm LoaiDuLieu thay vì Bien ***
                 const targetLoaiDuLieu = findLoaiDuLieuByPath(dataPath);

                 console.log("soLuongSelect change. Path:", JSON.stringify(dataPath), "Selected:", selectedValue, "Target LD:", targetLoaiDuLieu);


                 // *** SỬA CHỖ NÀY: Cập nhật targetLoaiDuLieu.SoLuong ***
                 if (targetLoaiDuLieu && targetLoaiDuLieu.Ten === 'array') {
                     if (selectedValue === '__custom__') {
                         soLuongInput.style.display = 'inline-block';
                         soLuongInput.value = 1;
                         targetLoaiDuLieu.SoLuong = 1; // Cập nhật state
                         soLuongInput.focus();
                     } else {
                         soLuongInput.style.display = 'none';
                         targetLoaiDuLieu.SoLuong = selectedValue; // Cập nhật state (lưu tên biến hoặc '')
                     }
                     console.log(`   -> Updated state SoLuong for ${JSON.stringify(dataPath)} to:`, targetLoaiDuLieu.SoLuong);
                 } else {
                     console.error("Không tìm thấy LoaiDuLieu kiểu array để cập nhật SoLuong tại path:", dataPath);
                 }
             });
             // Event listener cho Số Lượng Input
             soLuongInput.addEventListener('input', (e) => {
                 // *** SỬA CHỖ NÀY: Dùng parentPath ***
                 const dataPath = parentPath;
                 // *** SỬA CHỖ NÀY: Tìm LoaiDuLieu ***
                 const targetLoaiDuLieu = findLoaiDuLieuByPath(dataPath);

                 console.log("soLuongInput input. Path:", JSON.stringify(dataPath), "Value:", e.target.value, "Target LD:", targetLoaiDuLieu);


                 // *** SỬA CHỖ NÀY: Cập nhật targetLoaiDuLieu.SoLuong ***
                 if (targetLoaiDuLieu && targetLoaiDuLieu.Ten === 'array') {
                    targetLoaiDuLieu.SoLuong = parseInt(e.target.value, 10) || 0; // Cập nhật state
                    console.log(`   -> Updated state SoLuong for ${JSON.stringify(dataPath)} to:`, targetLoaiDuLieu.SoLuong);

                 } else {
                    console.error("Không tìm thấy LoaiDuLieu kiểu array để cập nhật SoLuong (input) tại path:", dataPath);
                 }
             });
             // Render Kiểu Phần Tử (đệ quy nếu cần)
             // Truyền path cho KieuPhanTu: parentPath + ['KieuPhanTu']
             renderKieuPhanTu(loaiDuLieu.KieuPhanTu, kieuPhanTuContainer, parentPath.concat(['KieuPhanTu']));

             container.appendChild(arrayConfigNode);
         } else if (loaiDuLieu.Ten === 'record') {
             const recordConfigNode = recordConfigTemplate.content.cloneNode(true);
            const membersListContainer = recordConfigNode.querySelector('.record-members-list');
             const addMemberButton = recordConfigNode.querySelector('.add-member-button');
             const addMemberForm = recordConfigNode.querySelector('.add-member-form');
             const newMemberNameInput = recordConfigNode.querySelector('.new-member-name');
             const confirmAddButton = recordConfigNode.querySelector('.confirm-add-member');
            const cancelAddButton = recordConfigNode.querySelector('.cancel-add-member');

             // Render danh sách thành viên hiện có (đệ quy)
             if (!Array.isArray(loaiDuLieu.DanhSachThanhVien)) loaiDuLieu.DanhSachThanhVien = []; // Đảm bảo là mảng
             loaiDuLieu.DanhSachThanhVien.forEach((memberBien, index) => {
                 const memberPath = parentPath.concat(['DanhSachThanhVien', index]); // Thêm path cho member
                 const memberElement = renderVariableItem(memberBien, true, memberPath); // Truyền path đúng
                 membersListContainer.appendChild(memberElement);
             });
             // Event listener cho nút "Thêm Thành Viên"
             addMemberButton.addEventListener('click', () => {
                 addMemberForm.style.display = 'flex';
                 newMemberNameInput.value = '';
                 newMemberNameInput.focus();
             });
             cancelAddButton.addEventListener('click', () => {
                  addMemberForm.style.display = 'none';
             });
             // Event listener cho nút "Xác nhận" thêm thành viên
              confirmAddButton.addEventListener('click', () => {
                  const memberName = newMemberNameInput.value.trim();
                  if (memberName) {
                       // *** SỬA: Dùng parentPath để tìm record cha ***
                       const targetRecordLoaiDuLieu = findLoaiDuLieuByPath(parentPath);

                      if (targetRecordLoaiDuLieu && targetRecordLoaiDuLieu.Ten === 'record') {
                           // Kiểm tra tên thành viên trùng
                           if (targetRecordLoaiDuLieu.DanhSachThanhVien.some(m => m.TenBien === memberName)) {
                               alert('Tên thành viên đã tồn tại trong record này!');
                               return;
                           }

                          const newMember = createDefaultBien(memberName); // Tạo thành viên mới với kiểu mặc định
                           if(newMember) {
                                targetRecordLoaiDuLieu.DanhSachThanhVien.push(newMember);
                                // Render lại chỉ phần record này
                                renderSpecificConfig(targetRecordLoaiDuLieu, container, parentPath);
                                addMemberForm.style.display = 'none'; // Ẩn form sau khi thêm
                           }
                      } else {
                           console.error("Không tìm thấy record để thêm thành viên:", parentPath);
                      }
                  }
              });
             container.appendChild(recordConfigNode);
         }
     }

      // Render cấu hình Kiểu Phần Tử cho Array (HÀM NÀY SẼ ĐƯỢC SỬA)
     function renderKieuPhanTu(kieuPhanTuData, container, currentPath) { // currentPath là path đến KieuPhanTu này
         container.innerHTML = '';

         // 1. Dropdown chọn kiểu cơ bản
         const kieuPhanTuSelect = document.createElement('select');
         kieuPhanTuSelect.classList.add('loai-du-lieu-select'); // Tái sử dụng class

         loaiDuLieuData.forEach(ld => {
             const option = document.createElement('option');
             option.value = ld.Ten;
             option.textContent = ld.Ten;
             if (kieuPhanTuData && kieuPhanTuData.Ten === ld.Ten) {
                 option.selected = true;
             }
             kieuPhanTuSelect.appendChild(option);
         });
         container.appendChild(kieuPhanTuSelect);

          // 2. Container cho cấu hình con (nếu là array/record)
         const nestedConfigContainer = document.createElement('div');
         nestedConfigContainer.classList.add('nested-type-config'); // Thêm class để định dạng nếu cần
         container.appendChild(nestedConfigContainer);
         // 3. Event listener cho select kiểu phần tử
         kieuPhanTuSelect.addEventListener('change', (e) => {
             const newElementTypeName = e.target.value;
             const dataPath = currentPath; // Path đã được truyền vào
             // Path đến array cha
             const parentArrayPath = dataPath.slice(0, -1);
             const parentArrayLoaiDuLieu = findLoaiDuLieuByPath(parentArrayPath);

             if (parentArrayLoaiDuLieu && parentArrayLoaiDuLieu.Ten === 'array') {
                 const newElementType = getLoaiDuLieuByName(newElementTypeName); // Lấy cấu trúc mới
                 if (!newElementType) return; // Không tìm thấy kiểu mới

                 parentArrayLoaiDuLieu.KieuPhanTu = newElementType; // Gán kiểu phần tử mới vào state

                  // *** SỬA CHỖ NÀY: Khởi tạo SoLuong = '' cho array con ***
                  // Khởi tạo mặc định nếu kiểu mới là array/record
                 if (parentArrayLoaiDuLieu.KieuPhanTu.Ten === 'array') {
                     // Đặt SoLuong mặc định là '' nếu chưa có hoặc null/undefined
                     if (parentArrayLoaiDuLieu.KieuPhanTu.SoLuong === null || parentArrayLoaiDuLieu.KieuPhanTu.SoLuong === undefined) {
                         parentArrayLoaiDuLieu.KieuPhanTu.SoLuong = '';
                     }
                     if (!parentArrayLoaiDuLieu.KieuPhanTu.KieuPhanTu) parentArrayLoaiDuLieu.KieuPhanTu.KieuPhanTu = getLoaiDuLieuByName('int');
                 } else if (parentArrayLoaiDuLieu.KieuPhanTu.Ten === 'record') {
                     if (!parentArrayLoaiDuLieu.KieuPhanTu.DanhSachThanhVien) parentArrayLoaiDuLieu.KieuPhanTu.DanhSachThanhVien = [];
                 }

                 // Render lại cấu hình con với path đúng của KieuPhanTu (dataPath)
                 renderNestedConfig(parentArrayLoaiDuLieu.KieuPhanTu, nestedConfigContainer, dataPath);
                 // Cập nhật lại các dropdown số lượng
                 updateAvailableIntVariables();

             } else {
                  console.error("Không tìm thấy Array cha để cập nhật Kiểu Phần Tử:", dataPath);
             }

         });
         // 4. Render cấu hình con ban đầu
         renderNestedConfig(kieuPhanTuData, nestedConfigContainer, currentPath);
     }

     // Render cấu hình con (nested) cho Array's KieuPhanTu hoặc Record's Member (giữ nguyên)
     function renderNestedConfig(nestedLoaiDuLieu, container, currentPath) {
          container.innerHTML = ''; // Xóa cấu hình con cũ
          if (nestedLoaiDuLieu && (nestedLoaiDuLieu.Ten === 'array' || nestedLoaiDuLieu.Ten === 'record')) {
              // Gọi lại hàm render cấu hình riêng, nhưng truyền vào container này và path mới
              renderSpecificConfig(nestedLoaiDuLieu, container, currentPath);
          }
     }

    // Render danh sách ràng buộc cho một biến (giữ nguyên)
    function renderConstraints(bienData, container, parentPath) {
        container.innerHTML = ''; // Xóa cũ
        const loaiDuLieuHienTai = bienData.LoaiDuLieu ? bienData.LoaiDuLieu.Ten : null;
        if (!loaiDuLieuHienTai) return;

        // Lọc các ràng buộc phù hợp
        const applicableConstraints = rangBuocData.filter(rb => rb.LoaiDuLieuApDung.includes(loaiDuLieuHienTai));
        applicableConstraints.forEach(rb => {
            const constraintNode = constraintTemplate.content.cloneNode(true);
            const checkbox = constraintNode.querySelector('.constraint-checkbox');
            const nameLabel = constraintNode.querySelector('.constraint-name');
            const descriptionSpan = constraintNode.querySelector('.constraint-description');
            const valueInput = constraintNode.querySelector('.constraint-value');

            checkbox.dataset.constraintName = rb.Ten; // Lưu tên ràng buộc để xử lý event
            nameLabel.textContent = rb.Ten;
            descriptionSpan.textContent = `(${rb.MoTa})`;

            // Kiểm tra xem ràng buộc này đã được chọn cho biến chưa
            const existingConstraint = bienData.DanhSachRangBuoc.find(appliedRb => appliedRb.Ten === rb.Ten);

            if (existingConstraint) {
                 checkbox.checked = true;
                valueInput.value = existingConstraint.GiaTri;
                valueInput.style.display = 'inline-block';
            } else {
                checkbox.checked = false;
                valueInput.value = rb.GiaTri; // Hiển thị giá trị mặc định (nhưng ẩn)
                valueInput.style.display = 'none';
            }

             // Đặt kiểu cho valueInput dựa trên ràng buộc (ví dụ)
             if (rb.Ten === 'GiaTriLonNhat' || rb.Ten === 'GiaTriNhoNhat') {
                 valueInput.type = 'number';
             } else {
                  valueInput.type = 'text'; // Hoặc có thể là checkbox nếu GiaTri là boolean
             }


             // Event listener cho checkbox
            checkbox.addEventListener('change', (e) => {
                 const isChecked = e.target.checked;
                 const constraintName = e.target.dataset.constraintName;
                 // Dùng parentPath để tìm đúng biến
                 const targetBien = findBienByPath(parentPath);

                if(targetBien) {
                     if (isChecked) {
                         // Thêm ràng buộc vào danh sách của biến
                         const newConstraint = getRangBuocByName(constraintName);
                         // Lấy giá trị hiện tại từ input (có thể là mặc định) và chuyển đổi kiểu
                         if (valueInput.type === 'number') {
                            newConstraint.GiaTri = parseFloat(valueInput.value) || 0;
                         } else {
                            newConstraint.GiaTri = valueInput.value;
                         }
                         targetBien.DanhSachRangBuoc.push(newConstraint);
                         valueInput.style.display = 'inline-block';
                     } else {
                         // Xóa ràng buộc khỏi danh sách
                         targetBien.DanhSachRangBuoc = targetBien.DanhSachRangBuoc.filter(appliedRb => appliedRb.Ten !== constraintName);
                         valueInput.style.display = 'none';
                         valueInput.value = getRangBuocByName(constraintName).GiaTri; // Reset về giá trị mặc định khi bỏ chọn
                     }
                 } else {
                     console.error("Không tìm thấy biến để cập nhật ràng buộc:", parentPath);
                 }
            });
            // Event listener cho ô nhập giá trị ràng buộc
            valueInput.addEventListener('input', (e) => {
                 const constraintName = checkbox.dataset.constraintName; // Lấy tên từ checkbox tương ứng
                 const newValue = e.target.value;
                 // Dùng parentPath để tìm đúng biến
                 const targetBien = findBienByPath(parentPath);

                if(targetBien) {
                     const constraintToUpdate = targetBien.DanhSachRangBuoc.find(appliedRb => appliedRb.Ten === constraintName);
                     if (constraintToUpdate) {
                          // Cập nhật giá trị (cần chuyển đổi kiểu nếu cần, ví dụ sang số)
                          if(e.target.type === 'number'){
                              constraintToUpdate.GiaTri = parseFloat(newValue) || 0;
                          } else {
                              constraintToUpdate.GiaTri = newValue;
                          }
                     }
                 }
            });


            container.appendChild(constraintNode);
        });
    }


    // --- Event Listeners Chính ---
    variableInput.addEventListener('input', renderVariablesList); // Giữ nguyên
    showJsonButton.addEventListener('click', () => { // Giữ nguyên
        // Tạo bản sao sâu và loại bỏ các thông tin không cần thiết (như DanhSachRangBuocCoThe) trước khi hiển thị
        const outputData = JSON.parse(JSON.stringify(Object.values(currentVariables), (key, value) => {
             if (key === 'DanhSachRangBuocCoThe' || key === 'LoaiDuLieuApDung' || key === 'MoTa') { // Loại bỏ các trường không cần thiết trong output cuối
                 return undefined;
             }
             // Đảm bảo không xuất mảng rỗng nếu không phải mảng thật sự (an toàn hơn)
             if (key === 'DanhSachThanhVien' && !Array.isArray(value)) {
                 return undefined;
             }
             return value;
        }));
        outputJsonContainer.textContent = JSON.stringify(outputData, null, 2); // null, 2 để format đẹp
    });
    const generateValuesButton = document.getElementById('generateValuesButton');
    const outputValues = document.getElementById('outputValues');
    const numFilesInput = document.getElementById('numFiles');
    const preFileName = document.getElementById('preFileName');
    // --- Khởi tạo lần đầu ---
    renderVariablesList(); // Giữ nguyên
    // --- Chức năng sinh giá trị  ---
    

    generateValuesButton?.addEventListener('click', () => {
        const numFiles = parseInt(numFilesInput.value);
        
        const zip = new JSZip();
        for(let i=1;i<=numFiles;i++){
            const resultText = generateValuesFromVariables(currentVariables);
            zip.file(`${preFileName.value}_${i}.txt`, resultText);

        }
        zip.generateAsync({ type: "blob" })
            .then(function(blob) {
                saveAs(blob, `${preFileName.value}`);
                messageDiv.classList.add('hidden');
                generateZipButton.disabled = false;
                alert('Đã tạo và tải xuống file ZIP thành công!');
            })
            .catch(function(error) {
                console.error("Lỗi tạo file ZIP:", error);
                messageDiv.textContent = "Lỗi khi tạo file ZIP.";
                generateZipButton.disabled = false;
            });

        const resultTextinline = generateValuesFromVariables(currentVariables);
        outputValues.textContent = resultTextinline;


    });
    function generateValuesFromVariables(state) {
        let lines = [];
        const variableValues = new Map(); // Lưu giá trị đã sinh ra cho từng biến

        Object.entries(state).forEach(([tenBien, bien]) => {
            const value = formatValueForVariable(bien, variableValues);
            variableValues.set(tenBien, value); // lưu lại giá trị
            lines.push(`${formatDisplayValue(value)}`);
        });
        return lines.join('\n');
    }

    function formatValueForVariable(bien, valueMap) {
        const type = bien.LoaiDuLieu.Ten;
        const constraints = bien.DanhSachRangBuoc || [];
        const getConstraint = (ten) => constraints.find(rb => rb.Ten === ten)?.GiaTri;
        switch (type) {
            case 'int': {
                const minInt = getConstraint('GiaTriNhoNhat') ?? 0;
                const maxInt = getConstraint('GiaTriLonNhat') ?? 100;
                return getRandomInt(minInt, maxInt);
            }
            case 'double': {
                const minDouble = getConstraint('GiaTriNhoNhat') ?? 0;
                const maxDouble = getConstraint('GiaTriLonNhat') ?? 100;
                return parseFloat(getRandomFloat(minDouble, maxDouble).toFixed(2));
            }
            case 'char':
                return generateRandomChar(constraints);
            case 'string':
                return generateRandomString(constraints);
            case 'array': {
                let length = 3; // Độ dài mặc định nếu không xác định được
                const soLuong = bien.LoaiDuLieu.SoLuong;

                if (typeof soLuong === 'number') {
                    length = soLuong >= 0 ? soLuong : 0; // Đảm bảo không âm
                } else if (typeof soLuong === 'string' && valueMap.has(soLuong)) {
                    const resolvedLength = parseInt(valueMap.get(soLuong));
                    length = !isNaN(resolvedLength) && resolvedLength >=0 ? resolvedLength : 0; // Kiểm tra NaN và âm
                } else if (soLuong !== '' && soLuong !== null && soLuong !== undefined) {
                    console.warn(`Không tìm thấy biến kích thước '${soLuong}' hoặc giá trị không hợp lệ. Dùng length=0.`);
                    length = 0; // Nếu có tên biến nhưng không tìm thấy, dùng 0
                } else {
                    // Nếu SoLuong là '', null, undefined (chưa chọn), dùng length mặc định ban đầu (ví dụ 3 hoặc 0)
                    console.warn(`Kích thước mảng không xác định ('${soLuong}'). Dùng length mặc định = ${length}.`);
                     // Giữ length = 3 như ban đầu hoặc đổi thành 0 nếu muốn
                     // length = 0;
                }


                if (!bien.LoaiDuLieu.KieuPhanTu) {
                    console.error("Mảng không có kiểu phần tử!");
                    return [];
                }
                return Array.from({ length }, () => formatValueForLoaiDuLieu(bien.LoaiDuLieu.KieuPhanTu, valueMap));
             }
            case 'record':
                if (!Array.isArray(bien.LoaiDuLieu.DanhSachThanhVien)) return []; // Trả về mảng rỗng nếu không có thành viên
                return bien.LoaiDuLieu.DanhSachThanhVien.map(m => formatValueForVariable(m, valueMap));
            default:
                return null;
         }
    }
    function formatValueForLoaiDuLieu(ld, valueMap) {
        // Tạo biến tạm để gọi hàm đệ quy
        return formatValueForVariable({ TenBien: '[Element]', LoaiDuLieu: ld, DanhSachRangBuoc: [] }, valueMap);
    }

    // Hiển thị giá trị phù hợp (chuỗi, mảng, record)
    function formatDisplayValue(value) {
        if (Array.isArray(value)) {
            // Sửa lại để xử lý đệ quy đúng cách
            return `${value.map(formatDisplayValue).join(' ')}`;
        }
        // Bỏ xử lý riêng cho object vì record trả về array
        // if (typeof value === 'object' && value !== null) { ... }
        if (typeof value === 'string') {
            // Bỏ dấu "" nếu không muốn
            // return `"${value}"`;
            return value;
        }
        return value; // Trả về số, char, null...
    }



    function getRandomInt(min, max) {
        min = parseInt(min); max = parseInt(max);
        if(isNaN(min)) min = 0; if(isNaN(max)) max = 100;
        if(min > max) [min, max] = [max, min];
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomFloat(min, max) {
        min = parseFloat(min); max = parseFloat(max);
        if(isNaN(min)) min = 0; if(isNaN(max)) max = 100;
        if(min > max) [min, max] = [max, min];
        return Math.random() * (max - min) + min;
    }

    function generateRandomChar(constraints) {
        let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        if (constraints.some(c => c.Ten === 'KhongChuaChuHoa')) {
            charset = charset.replace(/[A-Z]/g, '');
        }
        if (constraints.some(c => c.Ten === 'KhongChuaChuThuong')) {
            charset = charset.replace(/[a-z]/g, '');
        }
        if (constraints.some(c => c.Ten === 'KhongChuaCacKyTuDacBiet')) {
            charset = charset.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g, ''); // Cập nhật regex
        }
        return charset.length > 0 ? charset[Math.floor(Math.random() * charset.length)] : ' '; // Trả về space nếu rỗng
    }

    function generateRandomString(constraints, length = 5) { // Thêm độ dài mặc định
        return Array.from({ length: length }, () => generateRandomChar(constraints)).join('');
    }

}); // Kết thúc DOMContentLoaded