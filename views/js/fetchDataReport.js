
function convertTimeUtc(dateA) {

    const date = new Date(dateA);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    return formattedDate;
}
function openImage(imageUrl) {
    window.open(imageUrl, '_blank');
}
async function checkLogin(){
    var username = localStorage.getItem('username');
    var password = localStorage.getItem('password');
    console.log(username,password)
    if(username==null && password ==null){
        window.location.href = "../views/login.html";
    }
}
async function logOut(){
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    window.location.href = "../views/login.html";
}
checkLogin()
async function buttonViolate(id){
   
    await fetch('http://localhost:3000/report/violatereport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "post": id
        })
    })
    location.reload();
}
async function buttonNoViolate(id){
    console.log(id);
    await fetch('http://localhost:3000/report/noviolatereport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "post": id
        })
    })
    location.reload();
}
async function  getDetailReport(id)  {
    const table = document.querySelector('table[name="table-detail-fetch-report"]');
    table.innerHTML ="";
    console.log("dalick");
    await fetch('http://localhost:3000/report/detailreport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "id": id
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const tbody = document.createElement('tbody');
            tbody.innerHTML = `
                <tr>
									<td><strong>Tên tài khoản báo cáo</strong></td>
									<td> : ${data.user.name??""}</td>
								</tr>
                                <tr>
									<td><strong>Tên tài khoản sai phạm</strong></td>
									<td> : ${data.post!=null?data.post.user.name:"Bài viết đã bị gỡ do vi phạm"}</td>
								</tr>
								<tr>
									<td><strong>Nội dung báo cáo</strong></td>
									<td> : ${ data.content??"" }</td>
								</tr>
								<tr>
									<td><strong>Nội dung bài viết</strong></td>
									<td> : ${ data.post!=null?data.post.content:"Bài viết đã bị gỡ do vi phạm" }</td>
								</tr>
								<tr>
									<td><strong>Hình ảnh bài viết </strong></td>
									<td>${ data.post!=null?
                                       ""
                                        :": Hình ảnh của bài viết đã bị gỡ do vi phạm"
                                      }</td>
								</tr>
                                <tr>
                                    <div class="image-grid">
                                    ${ data.post!=null?
                                        data.post.image.map(e=>
                                            `<div class="image-grid-item">
                                           <a href="${"http://localhost:3000/showimage?image="+e.image_url}" target="_blank"> <img src="${"http://localhost:3000/showimage?image="+e.image_url} " alt="Image 2"> </a>
                                            </div>`
                                        ).join('')
                                        :""
                                      }
                                </div>
                                </tr>
								<tr>
									<td><strong>Thời gian</strong></td>
									<td> : ${convertTimeUtc(data.create_at)}</td>
								</tr>
                                ${
                                    data.post!=null? data.state=="wait"?  `<tr>
                                     <td><button class="vi-pham" onclick = buttonViolate("${data.post._id}") >Vi phạm</button>
                                     <button class="khong-vi-pham" onclick = buttonNoViolate("${data.post._id}")>Không vi phạm</button></td>
                                      
                                     
                                 </tr>`:   ``:''
                                }
                                
            </tr>
      `;
            table.appendChild(tbody);

            // xử lý dữ liệu trả về ở đây
        })
        .catch(error => {
            console.error(error);
            // xử lý lỗi ở đây
        });
}

async function getAllData() {
    const table = document.querySelector('table[name="table-data-fetch-report"] tbody');

    await fetch('http://localhost:3000/report/getallreport', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(data => {
            
            data.forEach(element => {
                
                const row = document.createElement('tr');
                row.innerHTML = `
        <td>${element.user.name}</td>
        <td>${element.content}</td>
        <td>${convertTimeUtc(element.create_at)}</td>
        <td>${element.state == 'done' ? "Đã xử lí" : "Chờ xử lí"}</td>
       
      `;        
                row.addEventListener('click', () => {
                    getDetailReport(element._id);
                });
                table.appendChild(row);
                // const detailButton = document.getElementById(`detail-${element._id}`);
                // console.log(detailButton);
                // if (detailButton) {
                //     detailButton.addEventListener('click', () => {
                //         getDetailReport(element._id);
                //     });
                // }
            });
            // xử lý dữ liệu trả về ở đây
        })
        .catch(error => {
            console.error(error);
            // xử lý lỗi ở đây
        });
}

getAllData()
