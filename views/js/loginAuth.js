


async function loginAdmin( ){
    var account = document.getElementById("account-input").value;
    var password = document.getElementById("password-input").value;
   
    await fetch('http://localhost:3000/user/loginadmin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": account,
            "password": password
        })
    }).then(response => response.json())
    .then(e=>{
        if(account!="" &&password !=""){
            if(e){
                
                    localStorage.setItem('username', account);
                    localStorage.setItem('password', password);
                    alert("Đăng nhập thành công!");
                    window.location.href = "../views/index.html";
               
                 
                
            }else{
                alert("Vui lòng thử lại!");
            }
        }else{
            alert("Tài khoản mật khẩu không được rỗng!");
        }
        
    });
     
}