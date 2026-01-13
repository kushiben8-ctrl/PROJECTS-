// const button=getElementById("btn")
const btnEl = document.querySelector(".btn");

btnEl.addEventListener("mouseover", (event) => {
    const x = (event.pageX - btnEl.offsetLeft);
    const y = (event.pageY - btnEl.offsetTop);
    btnEl.style.setProperty("--xPos", x + "px")
    btnEl.style.setProperty("--yPos", y + "px")

});


const click = document.getElementById("btn")
click.addEventListener("click",()=>{
    console.log("Changing the Color")
})