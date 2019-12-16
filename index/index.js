Page({
  data: {
    config:{
      imgsrc:'/res/'
    },
    title:'画板',
    explode:true,
    canvas:{
      canvas:false,
      width:0,
      height:0,
      drawing:false,
      color:"#000000",
      column:"1px",
      type:"pencle",//pencle eraser 
      steps:[],
    }
  },
  onLoad: function (e) {
    var _this = this;
    wx.setNavigationBarTitle({
      title: this.data.title
    })
    var res = wx.getSystemInfoSync();
    this.setData({
      ['canvas.width']:res.screenWidth,
      ['canvas.height']:res.screenHeight,
    })
    this.data.canvas.canvas = wx.createCanvasContext('canvas', this);
  },
  do(e){
    var _this = this;
    e.data = JSON.parse(e.data)
    if (e.data.data && e.data.data.length > 0) {
      e.data.data = JSON.parse(e.data.data)
    }
    if(e.data.from == 'local'){
      if(e.data.type=='boxstatus'){
        _this.setData({
          barrage:e.data.data.isopenbullet
        })
      }
    }
  },
  change(e){
    this.setData({
      ['canvas.'+e.currentTarget.dataset.keyword]:e.currentTarget.dataset.value
    })
  },
  draw(e){
    var canvas = this.data.canvas;
    if(e.type=='touchstart'){
      canvas.steps.push({
        color:canvas.color,
        column:canvas.column,
        type:canvas.type,
        points:[
          [
            e.touches[0].clientX,
            e.touches[0].clientY,
          ]
        ]
      })
    }
    if(e.type=='touchmove'){
      canvas.steps[canvas.steps.length-1].points.push([
        e.touches[0].clientX,
        e.touches[0].clientY,
      ]);
      if(canvas.type=='pencle'){
        if(canvas.steps[canvas.steps.length-1].points.length==3){
          this.do();
        }
        if(canvas.steps[canvas.steps.length-1].points.length>3 && canvas.steps[canvas.steps.length-1].points.length%2==0){
          this.do();
        }
      }
      if(canvas.type=='eraser'){
        this.eraser();
      }
    }
  },
  eraser(){
    var canvas = this.data.canvas;
    var c = canvas.canvas;
    var ls = canvas.steps[canvas.steps.length-1];
    var i = ls.points.length-1;
    //var canclewidth = +canvas.column.split("px")[0]*3;//橡皮按宽度调整
    var canclewidth = 10;//橡皮固定为10px
    c.clearRect(ls.points[i][0]-canclewidth, ls.points[i][1]-canclewidth,canclewidth*2,canclewidth*2);
    c.draw(true);
  },
  do(){
    var canvas = this.data.canvas;
    var c = canvas.canvas;
    var ls = canvas.steps[canvas.steps.length-1];
    var i = ls.points.length-1;
    c.moveTo(ls.points[i-2][0], ls.points[i-2][1]);
    c.bezierCurveTo(
      ls.points[i-2][0],
      ls.points[i-2][1],
      ls.points[i-1][0],
      ls.points[i-1][1],
      ls.points[i][0],
      ls.points[i][1]
    );

    c.setStrokeStyle(ls.color);
    c.setLineWidth(ls.column.split("px")[0]);
    c.setLineCap('round');
    c.setLineJoin('round');

    c.stroke()
    c.draw(true);
  },
  last(){
    var canvas = this.data.canvas;
    canvas.steps.splice(canvas.steps.length - 1, 1);
    this.redraw();
  },
  clear(){
    this.data.canvas.steps = [];
    this.data.canvas.canvas.clearRect(0, 0, this.data.canvas.width,this.data.canvas.height)
    this.data.canvas.canvas.draw(false);
  },
  redraw(){
    var canvas = this.data.canvas;
    var c = this.data.canvas.canvas;
    this.data.canvas.canvas.draw(false);
    for(var j in canvas.steps){
      if(canvas.steps[j].type=='pencle'){
        for(var i in canvas.steps[j].points){
          var d = canvas.steps[j].points;
          if(i==2){
            c.moveTo(d[i-2][0], d[i-2][1]);
            c.bezierCurveTo(
              d[i-2][0],
              d[i-2][1],
              d[i-1][0],
              d[i-1][1],
              d[i][0],
              d[i][1]
            );
          }
          if(i>2 && i%2==0){
            c.bezierCurveTo(
              d[i-2][0],
              d[i-2][1],
              d[i-1][0],
              d[i-1][1],
              d[i][0],
              d[i][1]
            );
          }
  
        }
        c.setStrokeStyle(canvas.steps[j].color);
        c.setLineWidth(canvas.steps[j].column.split("px")[0]);
        c.setLineCap('round');
        c.setLineJoin('round');
        c.stroke()
        c.draw(true);
      }
      if(canvas.steps[j].type=='eraser'){
        for(var i in canvas.steps[j].points){
          var d = canvas.steps[j].points;
          //var canclewidth = +canvas.column.split("px")[0]*3;//橡皮按宽度调整
          var canclewidth = 10;//橡皮固定为10px
          c.clearRect(canvas.steps[j].points[i][0] - canclewidth, canvas.steps[j].points[i][1] + canclewidth, canclewidth*2, canclewidth*2);
        }
        c.draw(true);
      }
    }
  },
  return(){
    wx.navigateBack({
      delta: 1
    });
  },
  explode(){
    this.setData({
      explode:!this.data.explode
    })
  }
})