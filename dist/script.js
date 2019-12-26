console.clear()
// 向量方法 ----------------------------
// 1. 先建立vec2
class Vec2 {
  constructor(x,y){
    this.x = x || 0
    this.y = y || 0
  }
  add(v){
    return new Vec2(this.x+v.x,this.y+v.y)
  }
  sub(v){
    return new Vec2(this.x-v.x,this.y-v.y)
  }
  mul(mul){
    return new Vec2(this.x*mul,this.y*mul)
  }
  set(x,y){
    this.x = x
    this.y = y
    return this
  }
  move(x,y){
    this.x+=x
    this.y+=y
    return this
  }
  equal(v){
    return this.x==v.x && this.y==v.y
  }
  clone(){
    return new Vec2(this.x,this.y)
  }
  toString(){
    return `(${this.x} ,${this.y})`
  }
  get angle(){
    return Math.atan2(this.y,this.x)
  }
  get unit(){
    return this.mul(1/this.length)
  }
  get length(){
    return Math.sqrt(this.x*this.x+this.y*this.y)
  }
  
  set length(l){
    //let temp = this.unit.mul(l)
    this.set(this.unit.mul(l).x,this.unit.mul(l).y)
  }

}
var v = new Vec2(3,4)
var v2 = new Vec2(3,4)
console.log(v.unit)
console.log()
// 定義會用到的屬性
// 全局時間(次數)
var time = 0
var FPS = 30
var PI2 = Math.PI*2
var bgc = 'black'
// 控制器---------------------------
var controls = {
  start: false,
  night: false,
  value: 0,
  FPS:FPS,
  side: 5
}
var gui = new dat.GUI()
gui.add(controls,'start').listen().onChange(value=>{
  if(value){
    loaded()
  }
})
gui.add(controls,'night').listen().onChange(value=>{
  controls.night = value
})
// 動畫----------------------------
var canvas = document.getElementById('mycanvas')
var ctx = canvas.getContext('2d')
var ww = canvas.width = window.innerWidth
var wh = canvas.height = window.innerHeight
// 自定會用到的ctx繪圖方法
ctx.circle = function(v,r){
  ctx.arc(0,0,r,0,PI2)
  ctx.fill()
}
ctx.line = function(v1,v2){
  ctx.moveTo(v1.x,v1.y)
  ctx.lineTo(v2.x,v2.y)
  ctx.stroke()
}
ctx.side = function(side,r){
  ctx.save()
    ctx.moveTo(r,0)
    for(var i=0;i<side;i++){
      ctx.rotate(PI2/side)
    ctx.lineTo(r,0)
    }
    ctx.stroke()
  ctx.restore()
}
//circle =------------------------------
var degToPI = Math.PI/180
class Circle{
  constructor(args){
    let def = {
      p: new Vec2(),
      r: 200,
      color: function(i){return '#fff'},
      lineTo:function(i){return true},
      fillText: function(i){return false},
      fillRect:function(i){return false},
      getWidth: function(i){return 1},
      anglePan: function(i){return 0},
      vertical: function(i){return false},
      getVerticalWidth: function(i){return 2},
      ramp: function(i){return 0},
      translate: new Vec2()
    }
    Object.assign(def,args)
    Object.assign(this,def)
  }
  draw(){ 
    ctx.save()
      ctx.beginPath()
      ctx.translate(this.translate.x,this.translate.y)
      //ctx.moveTo(0,0)
      for(var i=0;i<360;i++){
      // 加上旋轉的角度(可以用time控制)
      var angle1 = i+this.anglePan()
      var angle2 = i-1+this.anglePan()
      //半徑加上振幅控制
      var user_r = this.r+this.ramp(i)*Math.sin(i/this.r*30)
      var user_r2 = this.r+this.ramp(i)*Math.sin(i/this.r*30)
      let x1 = user_r*Math.cos(angle1*degToPI)
      var y1 = user_r*Math.sin(angle1*degToPI)
      var x2 = user_r2*Math.cos(angle2*degToPI)
      var y2 = user_r2*Math.sin(angle2*degToPI)
      ctx.beginPath()
        //水平線段連起來
      if(this.lineTo(i)){
        ctx.moveTo(x1,y1)
        ctx.lineTo(x2,y2)
      }
      // 垂直線段
      if(this.vertical(i)){
        let l = this.getVerticalWidth(i)
        let x3 = (user_r+l)*Math.cos(angle1*degToPI)
        let y3 = (user_r+l)*Math.sin(angle1*degToPI)
        ctx.moveTo(x1,y1)
        ctx.lineTo(x3,y3)
        //ctx.lineWidth = this.getVerticalWidth(i)
      }
      //畫文字
      if(this.fillText(i)){
        ctx.fillStyle = this.color(i)
        var text = (i/30+3)%12
        if(text==0){
          text=12
        }
        ctx.fillText(text,x1-5,y1+5)
      }
      ctx.strokeStyle = this.color(i)
      ctx.lineWidth = this.getWidth(i)
      ctx.stroke()
    }
    ctx.restore()
  }
}
// particle ----------------------------
function rand(min,max){
  return Math.random()*(max-min)+min
}
class Particle {
  constructor(args){
    let def = {
      p: new Vec2(),
      v: new Vec2(),
      fade: 0.12,
      startLife:7,
      startRadius: rand(1,25),
      alpha: 0.8
    }
    Object.assign(def,args)
    Object.assign(this,def)
    this.radius = this.startRadius
    this.life = this.startLife
  }
  reset(){
    this.p = new Vec2()
    this.v =  new Vec2()
    this.fade= 0.12
    this.startLife=7
    this.startRadius= rand(1,25)
    this.alpha= 0.8
    this.radius = this.startRadius
    this.life = this.startLife
  }
  update(){
    this.v = this.v.add(new Vec2(rand(-100,100)/1500,-this.life/50))
    this.p = this.p.add(this.v)
    this.radius = this.startRadius*(this.life/this.startLife)
    this.alpha = this.life/this.startLife
    this.life -= this.fade
    if(this.life<this.fade){
      this.reset()
    }
  }
  draw(){
    ctx.beginPath()
    ctx.save()
      ctx.arc(this.p.x,this.p.y,this.radius,0,2*Math.PI)
      var hue = mousePos.sub(new Vec2(ww/2,wh/2)).length
      ctx.fillStyle = 'hsla('+hue+',100%,90%,'+this.alpha+')'
      ctx.fill()
    ctx.restore()
  }
}
class Fire {
  constructor(args){
    let def = {
      p: new Vec2(),
      v: new Vec2(),
      particles: []
    }
    Object.assign(def,args)
    Object.assign(this,def)
    this.radius = this.startRadius
    this.life = this.startLife
  }
}
// 動畫四大步驟
// 1. initCnanvas  // 2. init  // 3. update邏輯  // 4. draw 畫上去
function initCnanvas(){
  ww = canvas.width = window.innerWidth
  wh = canvas.height = window.innerHeight
}
var circles = []
var fires = []
function init(){
  // put Particle
  fires.push(new Fire({
    p: new Vec2(-400,-100)
  }))
  fires.push(new Fire({
    p: new Vec2(400,-100)
  }))
  fires.push(new Fire({
    p: new Vec2(400,200)
  }))
  fires.push(new Fire({
    p: new Vec2(-400,200)
  }))
  circles.push(new Circle())
  circles.push(new Circle({
    r:260
  }))
  // 大刻度
  circles.push(new Circle({
    r:245,
    anglePan(i){
      return time/10
    },
    lineTo(i){
      return i%30==0  
    },
    getWidth(i){
      return 10
    },
    color(i){
      return i%120==0?'yellow':'#fff'
    }
    
  }))
  // 外圍刻度
  circles.push(new Circle({
    r:265,
    lineTo:function(i){
      return false 
    },
    vertical:function(i){
      return i%6==0
    },
    getVerticalWidth:function(i){
      return 8
    },
    
  }))
  // sin
  circles.push(new Circle({
    r:300,
    ramp: function(i){
      let ran = i%50<25?0:Math.random()*10
      return 10 + ran
    },
    getWidth:function(i){
      return i%50<25?5:1
    }
  }))
  // small center
  circles.push(new Circle({
    r:5
  }))
  // three small -right
  circles.push(new Circle({
    r:20,
    translate: new Vec2(100,0),
    lineTo: function(i){
      return false
    },
    vertical: function(i){return i%90==0},
    getVerticalWidth: function(i){return 30}
  }))
  // three small -left
  circles.push(new Circle({
    r:60,
    ramp:function(i){
      return 5
    },
    getWidth: function(i){
      return i%40<20?5:1
    },
    anglePan:function(){
      return -time/10
    },
    translate: new Vec2(-100,0)
  }))
  // three small -bottom -date
  circles.push(new Circle({
    r:60,
    translate: new Vec2(0,100),
    getWidth: function(i){
      return i%90<45?4:1
    },
    color: function(i){
      
      return i%90>25?'hsl('+Math.random()*50+20+',100%,90%)':'#fff'
    }
  }))
  // three small -bottom -date-text
  circles.push(new Circle({
    r:45,
    translate: new Vec2(0,100),
    lineTo: function(i){
      return false
    },
    fillText:function(i){
      return i%30==0
    }

  }))
  
}
function drawTime(number,degree,color,size,translate){
  let angle = 360/degree*number*degToPI - Math.PI/2
  ctx.save()
    ctx.beginPath()
    ctx.translate(translate.x,translate.y)
    ctx.moveTo(0,0)
    ctx.lineTo(size.y*Math.cos(angle),size.y*Math.sin(angle))
    ctx.strokeStyle = color
    ctx.lineWidth = size.x
    ctx.stroke()
  ctx.restore()
  
}
function update(){
  FPS = controls.FPS
  fires.forEach(fire=>{
    fire.particles.forEach(particle=>{
      particle.update()
    })
  })
  time++
  if(controls.start){
     setTimeout(update,1000/FPS)
  } 
}
function draw(){
  ctx.fillStyle = bgc
  ctx.fillRect(0,0,ww,wh)
  // draw fire
  fires.forEach(fire=>{
    if(fire.particles.length<200){
      fire.particles.push(new Particle())
    }
    ctx.save()
    ctx.translate(ww/2,wh/2)
    ctx.translate(fire.p.x,fire.p.y)
    fire.particles.forEach(particle=>{
      particle.draw()
    })
    ctx.restore()
  })
  // draw clock
  ctx.save()
    ctx.translate(ww/2,wh/2)
    ctx.beginPath()
    if(controls.night){
      ctx.arc(0,0,200,0,2*Math.PI)
      ctx.fillStyle = 'hsla(147, 79%, 57%,0.7)'
      ctx.fill()
    }
    ctx.beginPath()
    circles.forEach(cir=>{
      ctx.save()
      if(cir.r>100){
        let trans = mousePos.sub(new Vec2(ww/2,wh/2)).mul(4/cir.r)
        ctx.translate(trans.x,trans.y)
      }
      cir.draw()
      ctx.restore()
    })
    // draw time---------------------------------------------------------------
    let h= new Date().getHours()
    let m= new Date().getMinutes()
    let s= new Date().getSeconds()
    let month = new Date().getMonth()+1
    drawTime(h,12,'red',new Vec2(5,90),new Vec2())
    drawTime(m,60,'#fff',new Vec2(3,150),new Vec2())
    drawTime(s,60,'#fff',new Vec2(2,230),new Vec2())
    drawTime(month,12,'rgba(255,255,255,0.5)',new Vec2(5,40),new Vec2(0,100))
    
    let date = new Date().getDate()
    ctx.save()
    ctx.beginPath()
    ctx.translate(0,140)
    ctx.fillStyle = '#fff'
    ctx.fillRect(-15,15,30,30)
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 4
    ctx.strokeRect(-15,15,30,30)
    ctx.stroke()
    ctx.fillStyle = '#ea933c'
    ctx.font = '20px Arial'
    ctx.fillText(date,-10,37)
    ctx.restore()
    
  ctx.restore()
  if(controls.start){
    requestAnimationFrame(draw)
  } 
}

function loaded(){
  initCnanvas()
  init()
  draw()
  update()
}
// 其他監聽事件----------------------------
// loaded
window.addEventListener('load',loaded)

// 畫布隨螢幕調整
window.addEventListener('resize',initCnanvas)

// 滑鼠事件----------------------------
var mousePos = new Vec2()
var mousePosDown = new Vec2()
var mousePosUp = new Vec2()

function mousedown(evt){
  mousePos.set(evt.x,evt.y)
  mousePosDown = mousePos.clone()
}
function mousemove(evt){
  mousePos.set(evt.x,evt.y)
  //console.log(mousePos)
}
function mouseup(evt){
  mousePos.set(evt.x,evt.y)
  mousePosUp = mousePos.clone()
}
// 滑鼠監聽事件 ----------------------------
canvas.addEventListener('mousedown',mousedown)
canvas.addEventListener('mousemove',mousemove)
canvas.addEventListener('mouseup',mouseup)