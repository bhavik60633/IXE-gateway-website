/* Enquiry Page JavaScript */

// Particles
(function(){
  var c=document.getElementById('particles');
  if(!c) return;
  for(var i=0;i<18;i++){
    var p=document.createElement('div');
    p.className='particle';
    var s=Math.random()*8+4;
    p.style.cssText='width:'+s+'px;height:'+s+'px;left:'+Math.random()*100+'%;animation-duration:'+(Math.random()*15+10)+'s;animation-delay:'+(Math.random()*10)+'s;';
    c.appendChild(p);
  }
})();

// Scroll Reveal
var observer=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');}});
},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.reveal, .trigger').forEach(function(el){observer.observe(el);});

// Scroll-linked Truck Animation
var truck = document.querySelector('.truck-assembly');
var truckSection = document.querySelector('.truck-section');
var isTicking = false;

if (truck && truckSection) {
  window.addEventListener('scroll', function() {
    if (!isTicking) {
      window.requestAnimationFrame(function() {
        var rect = truckSection.getBoundingClientRect();
        var windowHeight = window.innerHeight;
        var start = windowHeight;
        var end = windowHeight * 0.2;
        var current = rect.top;
        var progress = (start - current) / (start - end);
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;
        var xOffset = -100 + (progress * 100);
        truck.style.transform = 'translateX(' + xOffset + 'vw)';
        var opacity = progress * 1.5;
        if (opacity > 1) opacity = 1;
        truck.style.opacity = opacity;
        isTicking = false;
      });
      isTicking = true;
    }
  });
  window.dispatchEvent(new Event('scroll'));
}

// Custom Selects
document.querySelectorAll('.custom-select').forEach(function(sel){
  var trigger=sel.querySelector('.select-trigger');
  var opts=sel.querySelector('.select-options');
  var hidden=sel.querySelector('input[type="hidden"]');
  var label=trigger.querySelector('.select-label');
  var formGroup=sel.closest('.form-group');
  trigger.addEventListener('click',function(e){
    e.stopPropagation();
    document.querySelectorAll('.custom-select').forEach(function(s){
      if(s!==sel){
        s.querySelector('.select-trigger').classList.remove('active');
        s.querySelector('.select-options').classList.remove('open');
        var fg=s.closest('.form-group');
        if(fg) fg.classList.remove('active-select-group');
      }
    });
    trigger.classList.toggle('active');
    opts.classList.toggle('open');
    if(formGroup) formGroup.classList.toggle('active-select-group');
  });
  opts.querySelectorAll('.select-option').forEach(function(opt){
    opt.addEventListener('click',function(){
      var val=opt.getAttribute('data-value');
      hidden.value=val;
      label.textContent=opt.querySelector('.opt-text').textContent;
      label.classList.remove('placeholder');
      opts.querySelectorAll('.select-option').forEach(function(o){o.classList.remove('selected');});
      opt.classList.add('selected');
      trigger.classList.remove('active');
      opts.classList.remove('open');
      if(formGroup) formGroup.classList.remove('active-select-group');
    });
  });
});

document.addEventListener('click',function(){
  document.querySelectorAll('.custom-select').forEach(function(s){
    s.querySelector('.select-trigger').classList.remove('active');
    s.querySelector('.select-options').classList.remove('open');
    var fg=s.closest('.form-group');
    if(fg) fg.classList.remove('active-select-group');
  });
});

// Form Submit
document.getElementById('enquiryForm').addEventListener('submit',function(e){
  e.preventDefault();
  var btn=document.getElementById('submitBtn');
  var txt=document.getElementById('btnText');
  btn.disabled=true;
  txt.textContent='Sending...';
  btn.style.opacity='0.7';
  setTimeout(function(){
    var email=document.getElementById('email').value;
    var ref='IXE-'+Math.random().toString(36).substr(2,6).toUpperCase();
    document.getElementById('confirmEmail').textContent=email;
    document.getElementById('refId').textContent=ref;
    document.getElementById('successOverlay').style.display='flex';
    btn.disabled=false;
    txt.textContent='Send Enquiry';
    btn.style.opacity='1';
  },1200);
});

function closeSuccess(){
  document.getElementById('successOverlay').style.display='none';
  document.getElementById('enquiryForm').reset();
  document.querySelectorAll('.custom-select').forEach(function(s){
    var label=s.querySelector('.select-label');
    label.textContent=label.getAttribute('data-placeholder');
    label.classList.add('placeholder');
    s.querySelector('input[type="hidden"]').value='';
    s.querySelectorAll('.select-option').forEach(function(o){o.classList.remove('selected');});
  });
  window.scrollTo({top:0,behavior:'smooth'});
}
