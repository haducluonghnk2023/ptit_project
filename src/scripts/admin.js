// ===================== ĐỊNH NGHĨA CHUNG ==================== 
// Định dạng VND
const formatter = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
})

// Tự động tạo id
function generateUUIDV4() {
    return 'xxx-xxy'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ==================== DATABASE ==========================
let DATABASE = localStorage.getItem('DATABASE') ? JSON.parse(localStorage.getItem('DATABASE')) : {
    PRODUCTS: [],
    ACCOUNTS: [
        // Đặt vai trò mặc định của người dùng ADMIN
        {
            ID: generateUUIDV4(),
            username: "Hạ Đức Lương",
            phoneNumber: "0392096054",
            address: "Hà Nội",
            email: "admin@gmail.com",
            password: "123",
            role: "Admin"
        }
    ],
    ORDERS: []
};

localStorage.setItem('DATABASE', JSON.stringify(DATABASE));

// Nhận bảng để sử dụng
let PRODUCTS = DATABASE.PRODUCTS;
let ACCOUNTS = DATABASE.ACCOUNTS;
let ORDERS = DATABASE.ORDERS;

// ********************************* Tạo dữ liệu ********************************

let generate = document.getElementById('generate');
generate.addEventListener('click', generateData);

function generateData() {
    // đọc file json
    $.getJSON("script/data", function (data) {
        DATABASE.PRODUCTS = data.PRODUCTS;
        localStorage.setItem('DATABASE', JSON.stringify(DATABASE));
        location.reload();
    });
}


// ========================================= PRODUCT MANAGER ===========================================

//Khai báo biểu mẫu nhập vào
let code = document.getElementById('code');
let category = document.getElementById('category');
let name = document.getElementById('name');
let material = document.getElementById('material');
let price = document.getElementById('price');
let amount = document.getElementById('amount');
let entry = document.getElementById('entry');
let image = document.getElementById("image");

// Xác định phần tử
let tbody = document.getElementById('tbody');

window.onload = loadProductManager(PRODUCTS);

function loadProductManager(PRODUCTS) {
    PRODUCTS.forEach(product => {
        renderProduct(product);
    });
}

//Trang chủ
function renderProduct(product) {
    let contents = `
        <tr>
            <th scope="row">${product.code}</th>
            <td>
                <img width="120" height="80" src="../assets/images/${product.image}">
            </td>
            <td>${product.productName}</td>
            <td>${product.idcategory === "0" ? "Giày Nam" : product.idcategory === "1" ? "Giày Nữ" : "Phụ Kiện"}</td>
            <td>${formatter.format(product.price)}</td>
            <td>${product.material}</td>    
            <td>${product.amount}</td>
            <td>${product.entry}</td>
            <td class="text-center">
                <i class="fas fa-trash-alt text-danger" data-code="${product.code}" id="delete"></i>
                <i class="fas fa-edit text-info" data-code="${product.code}" id="edit"></i>
                <i class="fas fa-info-circle text-success" data-code="${product.code}" id="detail" data-toggle="modal" data-target="#productModal"></i>
            </td>
    </tr>`;
    tbody.innerHTML += contents;
}


// thêm mới sản phẩm
let add_new = document.getElementById('add_new_product');
add_new.addEventListener('click', actAddProduct);

function actAddProduct() {
    let images = image.value;
    let product = {
        code: code.value,
        idcategory: product_category.value,
        productName: name.value,
        material: material.value,
        price: price.value,
        amount: amount.value,
        entry: entry.value,
        image: images.slice(12, images.length) ,
    }

    if (validateForm(product) &&!checkExistProductCode(product.code) ){
        // Thêm sản phẩm vào mảng và cập nhật Local Storage
        PRODUCTS.push(product);
        localStorage.setItem('DATABASE', JSON.stringify(DATABASE));
        renderProduct(product);
        notificationAction("Thêm Sản Phẩm Thành Công.", "#12e64b");

        // Xóa biểu mẫu nhập
        let form_id = document.getElementById('form-id');
        form_id.querySelectorAll('input').forEach(function (input) {
            input.value = '';
            input.style.border = "1px solid #ced4da";
        });
    } else {
        // Xử lý thông báo lỗi
        if (!validateForm(product)) {
            notificationAction("Dữ liệu nhập không hợp lệ.", "#ff0000");
        } else {
            notificationAction("Sản phẩm đã tồn tại.", "#ff0000");
        }
    }
    // Bật nút thêm sản phẩm
    add_new.disabled = false;
}


//XÁc thực
function validateForm(product) {
    if (product.code === "" || product.productName === ""
        || product.material === "" || product.price === ""
        || product.amount === "" || product.entry === "" || product.image === "") {
        notificationAction("Vui Lòng Điền Đầy Đủ Thông Tin.", "#e61212");

        //Lỗi đầu vào
        let form_id = document.getElementById('form-id');
        let form_input = form_id.querySelectorAll('input');

        form_input.forEach(function (input) {
            if (input.value === "") {
                input.style.border = "1px solid red";
            } else {
                input.style.border = "1px solid #ced4da";
            }
        })

        add_new.disabled = true;
        return false;
    }
    return true;
}

// // kiểm tra mã sản phẩm
function checkExistProductCode(code) {
    let check = 0;
    PRODUCTS.forEach(function (product) {
        if (product.code === code) {
            notificationAction("Mã Sản Phẩm Đã Tồn Tại.", "#e61212");
            add_new.disabled = true;
            check++;
        }
    })

    if (check > 0) {
        return true;
    } else {
        return false;
    }

}

// // hiển thị thông báo
let notifi = document.getElementById('notifi');
let notifi_content = document.getElementById('notifi-content');

function notificationAction(content, color) {
    notifi_content.innerHTML = content;
    notifi.style.display = "block";
    notifi.style.width = "270px";
    notifi.style.backgroundColor = color;

    setTimeout(
        function () {
            notifi.style.display = "none";
        }, 3000);
}

//Xóa và cập nhật sản phẩm
tbody.addEventListener('click', actProduct);

function actProduct(event) {
    let ev = event.target;
    let data_code = ev.getAttribute('data-code');
    if (!ev) {
        return;
    }

    // Sửa
    if (ev.matches('#edit')) {
        let update = document.getElementById('update_product');
        let productFilter = PRODUCTS.filter(product => product.code === data_code);

        code.value = productFilter[0].code;
        product_category.value = productFilter[0].idcategory;
        name.value = productFilter[0].productName;
        material.value = productFilter[0].material;
        price.value = productFilter[0].price;
        amount.value = productFilter[0].amount;
        entry.value = productFilter[0].entry;

        add_new.style.display = "none";
        update.style.display = "inline-block";
        code.disabled = true;
        document.documentElement.scrollTop = 0;
    }
    // Chi tiết
    if (ev.matches('#detail')) {
        let product_detail = document.getElementById('product-detail');
        let productDetail = PRODUCTS.filter(product => product.code === data_code);
        let modals = `
                <h6>${productDetail[0].productName}</h6>
                <p>Code: ${productDetail[0].code} </p>
                <img width="220" height="180" src="../assets/images/${productDetail[0].image}" alt="">
                <div class="mt-2">Giá Tiền: ${formatter.format(productDetail[0].price)}</div>
                <div>Ngày Nhập Kho: ${productDetail[0].entry}</div>
        `;
        product_detail.innerHTML = modals;
    }
    // Xóa
    if (ev.matches('#delete')) {
        PRODUCTS = PRODUCTS.filter(product => product.code !== data_code);
        DATABASE.PRODUCTS = PRODUCTS;
        localStorage.setItem('DATABASE', JSON.stringify(DATABASE));
        ev.closest('tr').remove();
        notificationAction("Xóa Sản Phẩm Thành Công.", "#38e867");
    }
}

// Sửa
let update = document.getElementById('update_product');
update.addEventListener('click', actUpdate);

function actUpdate() {
    PRODUCTS.forEach(function (product) {
        if (product.code === code.value) {
            let images = image.value;
            product.idcategory = product_category.value;
            product.productName = name.value;
            product.material = material.value;
            product.price = price.value;
            product.amount = amount.value;
            product.entry = entry.value;
            if (images !== '') {
                product.image = images.slice(12, images.length);
            }
            localStorage.setItem('DATABASE', JSON.stringify(DATABASE));
            location.reload();
            notificationAction("Cập Nhật Sản Phẩm Thành Công.", "#1216e6");
        }
    })
}

// Tìm kiếm
let search = document.getElementById("search");
search.addEventListener('input', actSearch);
function actSearch() {
    let searchInput = search.value;
    let productCompare = PRODUCTS.filter(product => searchCompare(searchInput, product.productName));
    tbody.innerHTML = '';
    productCompare.forEach(product => {
        renderProduct(product);
    });
}
//Tìm kiếm so sánh
function searchCompare(searchInput, productName) {
    let searchInputLower = searchInput.toLowerCase();
    let productNameLower = productName.toLowerCase();
    return productNameLower.includes(searchInputLower);
}
// ========================================= ACCOUNT MANAGER ===========================================

// hiển thị tab
let s_product = document.getElementById('s_product');
let s_user = document.getElementById('s_user');
let s_order = document.getElementById('s_order');

let product_manager = document.getElementById('product-manager');
let user_manager = document.getElementById('user-manager');
let order_manager = document.getElementById('order-manager');

s_product.addEventListener('click', showProductManager);
s_user.addEventListener('click', showUserManager);
s_order.addEventListener('click', showOrderManager);

function showProductManager() {
    product_manager.style.display = 'block';
    user_manager.style.display = 'none';
    order_manager.style.display = 'none';
}

function showUserManager() {
    product_manager.style.display = 'none';
    user_manager.style.display = 'block';
    order_manager.style.display = 'none';
    renderAccount();
}

function showOrderManager() {
    product_manager.style.display = 'none';
    user_manager.style.display = 'none';
    order_manager.style.display = 'block';
    renderOrder();

}

// ========================================= Mở quản lí tab manager ===========================================

let user_tbody = document.getElementById('user_tbody');

function renderAccount() {
    let contents = '';
    ACCOUNTS.forEach(account => {
        contents += `
            <tr>
                <th scope="row">${account.ID}</th>
                <td>${account.username}</td>
                <td>${account.phoneNumber}</td>
                <td>${account.address}</td>
                <td>${account.email}</td>
                <td>${account.role}</td>
            </tr>`;
    })
    user_tbody.innerHTML = contents;
}

// ========================================= Quản lí đơn giản  ===========================================

let order_tbody = document.getElementById('order_tbody');

function renderOrder() {
    let contents = '';
    ORDERS.forEach(order => {
        let options = '';
        if (order.status === "Đặt Hàng") {
            options = `
                <option value="Đặt hàng" selected>Đặt hàng</option>
                <option value="Giao hàng thành công" >Giao hàng thành công</option>`
        } else {
            options = `
                <option value="Đặt Hàng">Đặt Hàng</option>
                <option value="Giao Hàng Thành Công" selected>Giao Hàng Thành Công</option>`
        }
        contents += `
            <tr>
                <th scope="row">${order.orderId}</th>
                <th scope="row">${order.userID}</th>
                <td>${order.createDate}</td>
                <td>${order.payMethod}</td>
                <td> 
                    <select class="form-control" id="orderStatus" data-id="${order.orderId}">
                        ${options}
                    </select>
                </td>
                <td>
                    <i class="fas fa-calendar-week text-info" data-code="${order.orderId}" id="order-detail" data-toggle="modal" data-target="#orderModal"></i>
                </td>
            </tr>`;
    })
    order_tbody.innerHTML = contents;

    actOrderDetail();
    actUpdateOrderStatus();
}

function actOrderDetail() {
    let order_detail = document.querySelectorAll('#order-detail');
    // let detail_content = document.getElementById('detail-content');

    order_detail.forEach(orderbtn => {
        orderbtn.addEventListener('click', renderOrderDetail);
    })

    function renderOrderDetail() {
        let data_code = this.getAttribute('data-code');
        ORDERS.forEach(o => {
            if (o.orderId == data_code) {
                renderCustomerOrderInfor(o);
            }
        })
    }
}

function renderCustomerOrderInfor(order) {
    let customer_info = document.getElementById('customer-info');
    let customer = order.customerInfo;

    customer_info.innerHTML = `
        <div class="col-2">
            <p>Tên Khách Hàng: </p>
            <p>Số Điện Thoại: </p>
            <p>Thư Điện Tử: </p>
            <p>Địa Chỉ Giao Hàng:</p>
            <p>Ghi Chú: </p>
        </div>
        <div class="col-7">
            <p>${customer.customerName}</p>
            <p>${customer.customerNumber}</p>
            <p>${customer.customerEmail}</p>
            <p>${customer.customerAddress}</p>
            <p>${customer.customerNote}</p>
        </div>
        <div class="col-3">
            <div class="bg-light p-2">
                <p>Mã Hóa Đơn: #${order.orderId}</p>
                <p>Ngày Tạo: ${order.createDate}</p>
            </div>
        </div>
        <div class="col-6">
            <p>Phương Thức Thanh Toán</p>
        </div>
        <div class="col-6">
            <p>${order.payMethod}</p>
        </div>
    `;
    renderCustomerProductInfo(order);
}

function renderCustomerProductInfo(order) {
    let customer_product = document.getElementById('customer-product');
    let total_order = document.getElementById('total-order');
    let contents = ``;
    let products = order.products;
    let total = 0;
    products.forEach(p => {
        contents += `
        <tr>
            <td>
                <img width="50" height="25" src="./assets/images/${p.image}" alt="">
            </td>
            <td>
              ${p.productName}  
            </td>
            <td>
              ${formatter.format(p.price)}
            </td>
            <td class="text-center">
              ${p.quantity}  
            </td>
            <td>
              ${formatter.format(p.quantity * p.price)} 
            </td>
        </tr>`;

        total += p.quantity * p.price;
    })

    customer_product.innerHTML = contents;
    total_order.innerText = `${formatter.format(total)}`;
}

function actUpdateOrderStatus() {
    let orderStatuss = document.querySelectorAll('#orderStatus');
    orderStatuss.forEach(orderStatus => {
        orderStatus.addEventListener('change', function () {
            ORDERS.forEach(order => {
                if (order.orderId === orderStatus.getAttribute('data-id')) {
                    order.status = orderStatus.value;
                    localStorage.setItem('DATABASE', JSON.stringify(DATABASE));
                }
            })
        });
    })

}

// **************



