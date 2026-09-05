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
function closeCheckout(){$("#checkoutModal").classList.remove("open");document.body.classList.remove("modal-open");const c=$("#paypal-button-container");if(c){c.hidden=true;c.dataset.rendered="";c.innerHTML="";}const b=$("#orderButton");if(b)b.style.display="";}
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

  if(!email){
    alert('Bitte gib deine E-Mail-Adresse ein.');
    $("#customerEmail").focus();
    return;
  }

  if(method!=="paypal"){
    alert(
      method==="psc"
        ? "Paysafecard ist ausgewählt. Für echte automatische PSC-Zahlungen muss noch ein unterstützter Zahlungsanbieter angebunden werden."
        : "Amazon Card ist ausgewählt. Für echte automatische Gutschein-Zahlungen muss noch ein unterstützter Zahlungsanbieter angebunden werden."
    );
    return;
  }

  if(typeof paypal==="undefined"){
    alert("PayPal konnte nicht geladen werden. Prüfe deine PayPal Client-ID und ob die Website online läuft.");
    return;
  }

  const total=cart.reduce((s,p)=>s+p.price,0).toFixed(2);
  const container=$("#paypal-button-container");

  container.hidden=false;
  $("#orderButton").style.display="none";
  container.innerHTML="";

  if(container.dataset.rendered==="true") return;

  paypal.Buttons({
    style:{
      layout:"vertical",
      shape:"rect",
      label:"paypal"
    },

    createOrder: (data, actions)=>{
      return actions.order.create({
        purchase_units:[{
          amount:{
            currency_code:"EUR",
            value:total
          },
          description:"CHUG TUNES PERFORMANCE"
        }]
      });
    },

    onApprove: async (data, actions)=>{
      const details=await actions.order.capture();
      alert("Zahlung erfolgreich! Danke, "+(details.payer?.name?.given_name || "für deinen Einkauf")+".");

      closeCheckout();
      cart.length=0;
      render();
      container.hidden=true;
      container.dataset.rendered="";
      $("#orderButton").style.display="";
    },

    onCancel: ()=>{
      alert("PayPal-Zahlung wurde abgebrochen.");
    },

    onError:(err)=>{
      console.error("PayPal Error:",err);
      alert("Bei der PayPal-Zahlung ist ein Fehler aufgetreten.");
    }
  }).render("#paypal-button-container");

  container.dataset.rendered="true";
};
selectMethod('paypal');
render();
