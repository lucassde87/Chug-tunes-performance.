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

function closeCheckout(){
  $("#checkoutModal").classList.remove("open");
  document.body.classList.remove("modal-open");
  const paypalBox=$("#paypal-button-container");
  if(paypalBox) paypalBox.style.display="none";
  $("#orderButton").style.display="";
}

function selectMethod(method){
  document.querySelectorAll('.payment-method').forEach(x=>x.classList.remove('selected'));
  const el=document.querySelector(`[data-method="${method}"]`);
  if(el) el.classList.add('selected');
  document.querySelectorAll('.payment-panel').forEach(x=>x.classList.remove('active'));
  const panel=$("#panel-"+method);
  if(panel) panel.classList.add('active');
  $("#selectedMethod").value=method;

  const paypalBox=$("#paypal-button-container");
  if(paypalBox) paypalBox.style.display="none";
  $("#orderButton").style.display="";
}

function startPayPal(){
  const email=$("#customerEmail").value.trim();
  if(!email){
    alert('Bitte gib deine E-Mail-Adresse ein.');
    return;
  }

  if(typeof paypal === "undefined"){
    alert('PayPal konnte nicht geladen werden. Bitte lade die Seite neu.');
    return;
  }

  const total=cart.reduce((s,p)=>s+p.price,0).toFixed(2);
  const container=$("#paypal-button-container");
  const orderButton=$("#orderButton");

  orderButton.style.display="none";
  container.style.display="block";
  container.innerHTML="";

  paypal.Buttons({
    style:{
      layout:"vertical",
      shape:"rect",
      label:"paypal"
    },
    createOrder:function(data,actions){
      return actions.order.create({
        purchase_units:[{
          description:"CHUG TUNES PERFORMANCE",
          amount:{
            currency_code:"EUR",
            value:total
          }
        }]
      });
    },
    onApprove:function(data,actions){
      return actions.order.capture().then(function(details){
        alert("Zahlung erfolgreich! Vielen Dank für deine Bestellung.");
        cart.length=0;
        render();
        closeCheckout();
      });
    },
    onCancel:function(){
      container.style.display="none";
      orderButton.style.display="";
    },
    onError:function(err){
      console.error("PayPal error:",err);
      alert("PayPal-Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.");
      container.style.display="none";
      orderButton.style.display="";
    }
  }).render("#paypal-button-container");
}

document.querySelectorAll(".add").forEach(b=>b.onclick=()=>{
  cart.push({name:b.dataset.name,price:+b.dataset.price});
  render();
  openCart();
});

$("#openCart").onclick=openCart;
$("#closeCart").onclick=closeCart;
$("#overlay").onclick=closeCart;
$("#checkout").onclick=openCheckout;
$("#closeCheckout").onclick=closeCheckout;
$("#checkoutModal").addEventListener('click',e=>{
  if(e.target.id==='checkoutModal')closeCheckout();
});
document.querySelectorAll('.payment-method').forEach(b=>{
  b.addEventListener('click',()=>selectMethod(b.dataset.method));
});
$("#orderButton").onclick=startPayPal;

selectMethod('paypal');
render();
