
// skill bar
let current = 0;
let interval = 200;

window.addEventListener('DOMContentLoaded', () => {
  let progressBar = document.querySelectorAll('.progress__bar');
  let valuesBar = ["80%","80%","60%","50%","50%"];
  let colorBar = ['#C2C2C2',"#C2C2C2",'#C2C2C2','#C2C2C2','#C2C2C2'];
  progressBar.forEach((progress,index) =>{
    progress.style.width = valuesBar[index];
    progress.style.backgroundColor = `${colorBar[index]}`
    setInterval(function animation(){
      if(current < parseInt(valuesBar[index])){
        current++;
        progress.innerHTML = `<span>${current}%`;
      }
    }, interval);
  });
});
// buton show more
let btnShowMore = document.querySelector('.btn__projectss');
btnShowMore.addEventListener('click', () =>{
  let hiddenElements = document.querySelectorAll('.row__projects__portofolio .none');
  let elements = Array.prototype.slice.call(hiddenElements).slice(0,2);
  elements.forEach((item,index) => {
    item.classList.add('block')
    item.classList.remove('none');
    if(index ===  0){
      item.scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
  if(hiddenElements.length === 0){
    btnShowMore.style.display = 'none';
  }
});
// small device
let container = document.querySelector('.container');
let smallDevice = window.matchMedia("(max-width:320px)");
smallDevice.addListener(handleDeviceScreen);
function handleDeviceScreen(e){
  if(e.matches){
    container.classList.add('containerElements');
  }else{
    container.classList.remove('containerElements');
  }
}
// modall gallery
let modalGallery = document.getElementById('modal__window');
let pict = document.getElementsByClassName('images-item')
let modalOpen = false;
let clickOutSide = false;

let modalClose = document.getElementById('modal__close');
modalClose.addEventListener('click', imageClose, false);

for(let i = 0; i < pict.length; i++){
  pict[i].addEventListener('click', imageOpen, false);
}
function imageOpen(i){
  listenerLaunch()
  modalGallery.style.display = "block";
  document.getElementById('modal__pict').innerHTML = '<img src="' + this.src + '">';
  clickOutSide = false;
  modalOpen = true;
}
function imageClose(){
  modalOpen = false;
  modalGallery.style.display = "none";
}
function listenerLaunch(){
  modalGallery.addEventListener('click', function(event){
    clickOutSide = !document.getElementById('modal__pict').getElementsByTagName("img")[0].contains(event.target);
    if(clickOutSide && modalOpen){
      modalGallery.style.display = "none";
      modalOpen = false;
    }
  });
}
// click menu list
let ul = document.querySelector('ul');
let li = document.querySelectorAll('li');

li.forEach(item => {
  item.addEventListener('click', () => {
    ul = document.querySelector('.active').classList.remove('active');
    item.classList.add('active');
  });
});
// sticky header
let btnTop = document.querySelector('.btn__top');
window.addEventListener('scroll',() => {
  let header = document.querySelector('header');
  header.classList.toggle('sticky', scrollY > 0);
  btnTop.classList.toggle('btn__topp', scrollY > 1500);
})
btnTop.onclick = clickbtn;
function clickbtn(){
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

let notFunctions = document.getElementsByClassName('notFunctions');
for(let i = 0;  i < notFunctions.length; i++){
  notFunctions[i].addEventListener('click', (e) => {
    e.preventDefault();
    window.alert('Sorry, this button cannot be used, check again later');
  });
}


