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

const ORDER_API_URL = "https://chug-tunes-performance.damonbond29.workers.dev";
const DISCORD_SERVER_URL = "https://discord.gg/DEIN-SERVER";

async function notifyDiscord(method){
  const email=$("#customerEmail").value.trim();
  if(!email){ alert('Bitte gib deine E-Mail-Adresse ein.'); return false; }
  const items=cart.map(p=>({name:p.name,price:p.price}));
  const total=cart.reduce((s,p)=>s+p.price,0);
  const status=$("#orderStatus");
  status.textContent='Bestellung wird an den Shop gemeldet…';
  try{
    const res=await fetch(ORDER_API_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email,method,items,total})
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    status.textContent='Bestellung wurde übermittelt. Bitte öffne jetzt Discord für weitere Schritte.';
    window.open(DISCORD_SERVER_URL,'_blank','noopener');
    return true;
  }catch(err){
    console.error('Order notification error:',err);
    status.textContent='Die Bestellung konnte gerade nicht übermittelt werden. Bitte versuche es später erneut.';
    return false;
  }
}

async function handleGiftCardOrder(method){
  const fieldId=method==='Paysafecard'?'pscCode':'amazonCode';
  const code=$("#"+fieldId).value.trim();
  if(!code){ alert('Bitte gib deinen '+method+'-Code ein.'); return; }
  if(method==='Paysafecard' && !/^\d{16}$/.test(code)){
    alert('Bitte gib einen gültigen 16-stelligen Paysafecard-Code ein.'); return;
  }
  // Aus Sicherheitsgründen wird der vollständige Gutschein-Code NICHT an Discord gesendet.
  // Das Backend erhält nur die Bestellung und kann die Zahlung manuell/offiziell prüfen.
  const ok=await notifyDiscord(method);
  if(ok){
    $("#"+(fieldId)).value='';
  }
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
$("#orderButton").onclick=()=>{
  const method=$("#selectedMethod").value;
  if(method==='paypal'){
    startPayPal();
  }else if(method==='psc'){
    handleGiftCardOrder('Paysafecard');
  }else{
    handleGiftCardOrder('Amazon Card');
  }
};


selectMethod('paypal');
render();
