const cart=[];const $=x=>document.querySelector(x);
function render(){let box=$("#items");$("#count").textContent=cart.length;let total=cart.reduce((s,p)=>s+p.price,0);$("#total").textContent=total+" €";$("#checkout").disabled=!cart.length;if(!cart.length){box.innerHTML='<p class="empty">Dein Warenkorb ist leer.</p>';return}box.innerHTML=cart.map((p,i)=>`<div class="item"><div><b>${p.name}</b><br><small>${p.price} €</small></div><button class="remove" onclick="remove(${i})">Entfernen</button></div>`).join("")}
function remove(i){cart.splice(i,1);render()}
function openCart(){$("#cart").classList.add("open");$("#overlay").classList.add("open")}
function closeCart(){$("#cart").classList.remove("open");$("#overlay").classList.remove("open")}
document.querySelectorAll(".add").forEach(b=>b.onclick=()=>{cart.push({name:b.dataset.name,price:+b.dataset.price});render();openCart()});
$("#openCart").onclick=openCart;$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#checkout").onclick=()=>alert("Checkout vorbereitet. PayPal/Zahlungsanbieter kann später hier angebunden werden.");
render();