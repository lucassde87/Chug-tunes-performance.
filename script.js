const cart=[];
const $=x=>document.querySelector(x);

function render(){
  const box=$("#items");
  $("#count").textContent=cart.length;
  const total=cart.reduce((s,p)=>s+p.price,0);
  $("#total").textContent=total.toFixed(2).replace('.',',')+" €";
  $("#checkout").disabled=!cart.length;
  if(!cart.length){box.innerHTML='<p class="empty">Dein Warenkorb ist leer.</p>';return}
  box.innerHTML=cart.map((p,i)=>`<div class="item"><div><b>${p.name}</b><br><small>${p.price.toFixed(2).replace('.',',')} €</small></div><button class="remove" onclick="remove(${i})">Entfernen</button></div>`).join("");
}
function remove(i){cart.splice(i,1);render()}
function openCart(){$("#cart").classList.add("open");$("#overlay").classList.add("open")}
function closeCart(){$("#cart").classList.remove("open");$("#overlay").classList.remove("open")}
function openCheckout(){
  if(!cart.length)return;
  closeCart();
  const total=cart.reduce((s,p)=>s+p.price,0);
  $("#checkoutItems").innerHTML=cart.map(p=>`<div><span>${p.name}</span><b>${p.price.toFixed(2).replace('.',',')} €</b></div>`).join("");
  $("#checkoutTotal").textContent=total.toFixed(2).replace('.',',')+" €";
  $("#checkoutModal").classList.add("open");
  document.body.classList.add("modal-open");
}
function closeCheckout(){$("#checkoutModal").classList.remove("open");document.body.classList.remove("modal-open")}
function selectMethod(method){
  document.querySelectorAll('.payment-method').forEach(x=>x.classList.remove('selected'));
  const el=document.querySelector(`[data-method="${method}"]`); if(el) el.classList.add('selected');
  document.querySelectorAll('.payment-panel').forEach(x=>x.classList.remove('active'));
  const panel=$("#panel-"+method); if(panel) panel.classList.add('active');
  $("#selectedMethod").value=method;
}

document.querySelectorAll(".add").forEach(b=>b.onclick=()=>{cart.push({name:b.dataset.name,price:+b.dataset.price});render();openCart()});
$("#openCart").onclick=openCart;
$("#closeCart").onclick=closeCart;
$("#overlay").onclick=closeCart;
$("#checkout").onclick=openCheckout;
$("#closeCheckout").onclick=closeCheckout;
$("#checkoutModal").addEventListener('click',e=>{if(e.target.id==='checkoutModal')closeCheckout()});
document.querySelectorAll('.payment-method').forEach(b=>b.addEventListener('click',()=>selectMethod(b.dataset.method)));
$("#orderButton").onclick=()=>{
  const method=$("#selectedMethod").value;
  const email=$("#customerEmail").value.trim();
  if(!email){alert('Bitte gib deine E-Mail-Adresse ein.');return}
  if(method==='paypal'){
    alert('PayPal ist als Zahlungsart vorbereitet. Für echte Zahlungen muss noch deine PayPal-Client-ID/Backend-Verbindung eingetragen werden. Dein PayPal Secret gehört niemals in die Website.');
  }else if(method==='psc'){
    alert('Paysafecard ist ausgewählt. Die automatische PSC-Zahlung wird erst aktiv, wenn ein geeigneter Zahlungsanbieter angebunden ist.');
  }else{
    alert('Amazon Card ist ausgewählt. Die automatische Gutschein-Zahlung wird erst aktiv, wenn ein geeigneter Zahlungsanbieter angebunden ist.');
  }
};
selectMethod('paypal');
render();
