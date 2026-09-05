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
let paypalRendered=false;

function paypalTotal(){
  return cart.reduce((s,p)=>s+p.price,0).toFixed(2);
}

function renderPayPalButtons(){
  if(paypalRendered || typeof paypal==='undefined') return;
  const container=$("#paypal-button-container");
  if(!container) return;
  paypalRendered=true;
  $("#orderButton").style.display='none';
  paypal.Buttons({
    style:{layout:'vertical',shape:'rect',label:'paypal'},
    onClick:()=>{
      const email=$("#customerEmail").value.trim();
      if(!email){
        alert('Bitte gib deine E-Mail-Adresse ein.');
        return;
      }
    },
    createOrder:(data,actions)=>{
      const email=$("#customerEmail").value.trim();
      if(!email) return Promise.reject(new Error('E-Mail-Adresse fehlt.'));
      const total=paypalTotal();
      return actions.order.create({
        purchase_units:[{
          description:'CHUG TUNES PERFORMANCE',
          amount:{currency_code:'EUR',value:total}
        }]
      });
    },
    onApprove:(data,actions)=>actions.order.capture().then(details=>{
      const name=details?.payer?.name?.given_name || 'Kunde';
      alert(`Zahlung erfolgreich! Danke ${name}. Bestell-ID: ${data.orderID}`);
      cart.length=0;
      render();
      closeCheckout();
    }),
    onCancel:()=>{
      $("#paypal-status").textContent='PayPal-Zahlung abgebrochen.';
    },
    onError:(err)=>{
      console.error('PayPal error:',err);
      $("#paypal-status").textContent='PayPal konnte nicht geladen/gestartet werden. Prüfe die Sandbox-Client-ID.';
    }
  }).render('#paypal-button-container').catch(err=>{
    console.error('PayPal render error:',err);
    $("#paypal-status").textContent='PayPal konnte nicht geladen werden. Prüfe die Sandbox-Client-ID.';
  });
}

$("#orderButton").onclick=()=>{
  const email=$("#customerEmail").value.trim();
  if(!email){alert('Bitte gib deine E-Mail-Adresse ein.');return}
  if($("#selectedMethod").value==='paypal') renderPayPalButtons();
};

if(typeof paypal!=='undefined'){
  renderPayPalButtons();
}else{
  window.addEventListener('load',()=>{
    if(typeof paypal!=='undefined') renderPayPalButtons();
    else $("#paypal-status").textContent='PayPal SDK wurde nicht geladen. Prüfe die Sandbox-Client-ID.';
  });
}

selectMethod('paypal');
render();
