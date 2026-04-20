import { useRef, useState, useEffect } from "react";

const CanvasComponent = ({ totalHour, dutyType, day, logs, totalMile, sheetDay, sheetMonth, sheetYear, value}) => {
  const canvasRef = useRef(null);
  const [fontSize, setFontSize] = useState({
    fontFamily1:"Arial",
    fontFamily2:"Arial",
    h1: "12px",    
    h3: "14px",
    h6: "18px"
  })

  const drawText = (canvas, text, x, y) => {
    const ctx = canvas.getContext("2d");
    ctx.font = `${fontSize.h3} ${fontSize.fontFamily1}`;
    ctx.fillText(text, x, y);
  };

  const drawRotateText = (canvas, text, x, y, size, bold, style, family, color = "black") => {
    const ctx = canvas.getContext("2d");
    ctx.font = `${style} ${bold} ${size} ${family}`;
    const angle = Math.PI / 3;  // 45 degrees

    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    // ctx.translate(0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "black";
  };

  const drawSheetText = (canvas, text, x, y, size, bold, style, family) => {
    const ctx = canvas.getContext("2d");
    ctx.font = `${style} ${bold} ${size} ${family} `;
    ctx.fillText(text, x, y);
  };
  

  const drawLine = (
    canvas,
    startX,
    startY,
    endX,
    endY,
    lineColor,
    lineWidth
  ) => {
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };


  const drawDailyLogs = (canvas, startXPos, startYPos, log) => {
    console.log(value);
    const ctx = canvas.getContext("2d");
    const x = startXPos;
    const y = startYPos;
    const width = 40;
    const height = 60;
    const borderColor = "black";
    const borderWidth = 1;
    const remark_height = 30;

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;

    for (let i = 0; i < totalHour; i++) {
      drawText(canvas, i, x + width * i, y - height / 12);


      for (let j = 0; j < dutyType.length; j++) {
        if (i === 0)
          drawText(
            canvas,
            dutyType[j].name,
            x - width - 60,
            y + height * j + 10
          );
      }
      i === 0 &&drawSheetText(canvas, 'REMARKS', x - width - 60, y + height + 240, "18px", 400, 'normal', 'Arial');

      drawText(canvas, i, x + width * i, y + height + 210);
      drawLine(canvas, x + width * i, y + height + 220, x + width * (i + 1), y + height + 220, 'black', 2);
      drawLine(canvas, x + width * i, y + height + 220, x + width * i, y + height + 220 + remark_height, 'black', 1);

      i === 23 && drawLine(canvas, x + width * (i + 1), y + height + 220, x + width * (i + 1), y + height + 220 + remark_height, 'black', 1);


      for (let k = 1; k < 4; k++) {
          drawLine(
            canvas,
            x + width * i + (width / 4) * k,
            y + height + 220,
            x + width * i + (width / 4) * k,
            k % 2 === 0 ? y + height + 220 + 7 * 2 : y + height + 220 + 7,
            borderColor,
            borderWidth
          );
      }

      for (let j = 0; j < dutyType.length; j++) {
        ctx.strokeRect(x + width * i, y + height * j, width, height);

        for (let k = 1; k < 4; k++) {
          drawLine(
            canvas,
            x + width * i + (width / 4) * k,
            y + height * j,
            x + width * i + (width / 4) * k,
            k % 2 === 0 ? y + height * j + (height / 4) * 2 : y + height * j + (height / 4),
            borderColor,
            borderWidth
          );
        }
      }

    }

    // draw aggregate lines 
    drawLine(canvas, x + 24 * width + 5, y + height, x + 24 * width + 80, y + height, "black", 2 );
    drawLine(canvas, x + 24 * width + 5, y + 2 * height, x + 24 * width + 80, y + 2 * height, "black", 2 );
    drawLine(canvas, x + 24 * width + 5, y + 3 * height, x + 24 * width + 80, y + 3 * height, "black", 2 );
    drawLine(canvas, x + 24 * width + 5, y + 4 * height, x + 24 * width + 80, y + 4 * height, "black", 2 );

    drawLine(canvas, x + 24 * width + 5, y + height + 220 + remark_height, x + 24 * width + 80, y + height + 220 + remark_height, "black", 2 );

    
    // aggregate time by duty
    let off_duty_time = 0;
    let sleeper_birth_time = 0;
    let driving_time = 0;
    let on_duty_time = 0;  
    // draw log
    log.map((part, index, array) => {

      const next_part = array[index + 1] !== undefined? array[index + 1] : null;
      let part_height = 0;
      let next_part_height = 0;
      switch (part.role) {
        case "DutyOff":
          part_height = y + height / 2;
          off_duty_time += part.duration;
          break;
        case "Driving":
          part_height = y + height * 5 / 2;
          driving_time += part.duration;
          break;
        case "DutyOn":
          part_height = y + height * 7 / 2;
          on_duty_time += part.duration;
          break;
        case "Sleeper Birth":
          part_height = y + height * 3 / 2;
          sleeper_birth_time += part.duration;
          break;
        default:
          break;
      }
      if(next_part !== null)
        switch (next_part.role) {
          case "DutyOff":
            next_part_height = y + height / 2;
            break;
          case "Driving":
            next_part_height = y + height * 5 / 2;
            break;
          case "DutyOn":
            next_part_height = y + height * 7 / 2;
            break;
          case "Sleeper Birth":
            next_part_height = y + height * 3 / 2;
            break;
          default:
            break;
        }
      
      drawLine(canvas, x + part.actual_time * width , part_height, x + part.actual_time * width + part.duration * width, part_height, "green", 5);
      if(next_part !== null) drawLine(canvas, x + part.actual_time * width + part.duration * width, part_height, x + part.actual_time * width + part.duration * width, next_part_height, "green", 5);

      // draw  information line for remark
      drawLine(canvas, x + part.actual_time * width , y + height + 220 + remark_height + 3, x + part.actual_time * width, y + height + 220 + remark_height + 20, "#3fb1ce", 1);
      drawLine(canvas, x + part.actual_time * width , y + height + 220 + remark_height + 20, x + part.actual_time * width + part.duration * width, y + height + 220 + remark_height + 20, "#3fb1ce", 1);
      drawLine(canvas, x + part.actual_time * width + part.duration * width , y + height + 220 + remark_height + 3, x + part.actual_time * width + part.duration * width, y + height + 220 + remark_height + 20, "#3fb1ce", 1);

      if(part.event == "Picking Up")
        drawRotateText(canvas, value.pickupLocation, x + part.actual_time * width, y + height + 220 + remark_height + 35, "17px", 400, 'normal', "Arial", "green");
      else if(part.event == "Droping Off")
        drawRotateText(canvas, value.dropoffLocation, x + part.actual_time * width, y + height + 220 + remark_height + 35, "17px", 400, 'normal', "Arial", "green");
      else
        drawRotateText(canvas, part.event, x + part.actual_time * width, y + height + 220 + remark_height + 35, "17px", 400, 'normal', "Arial");
    })

    // display aggregate time by duty
    drawSheetText(canvas,  Math.round(off_duty_time * 10) / 10, x + 24 * width + 10, y + height - 3, "25px", 400, "italic", "Arial");
    drawSheetText(canvas, Math.round(sleeper_birth_time * 10) / 10, x + 24 * width + 5, y +  2 * height - 3, "25px", 400, "italic", "Arial");
    drawSheetText(canvas, Math.round(driving_time * 10) / 10, x + 24 * width + 5, y + 3 * height - 3, "25px", 400, "italic", "Arial");
    drawSheetText(canvas, Math.round(on_duty_time * 10) / 10, x + 24 * width + 5, y + 4 * height - 3, "25px", 400, "italic", "Arial");

    let total_time =  off_duty_time + sleeper_birth_time + driving_time + on_duty_time;
    drawSheetText(canvas, "=" + total_time , x + 24 * width + 5, y + height + 220 + remark_height, "25px", 400, "italic", "Arial");
  };

  const drawSheet = (canvas, totalMile, sheetDay, sheetMonth, sheetYear) => {
    drawSheetText(canvas, "DRIVER'S DAILY LOG", 500, 50, "21px", 600, "normal", "Arial");
    drawSheetText(canvas, "U.S.DEPARTMENT OF TRANSPORTATION", 20, 80, "14px", 100, "normal", "Arial");
    drawSheetText(canvas, "(ONE CALENDAR DAY - 24 HOURS)", 490, 70, "14px", 400, "normal", "Arial");
    drawSheetText(canvas, "ORIGINAL-Submit to carrier within 13days", 800, 55, "14px", 400, "normal", "Arial");
    drawSheetText(canvas, "DUPLICATE-Driver retains possession for eight days", 800, 70, "14px", 400, "normal", "Arial");
    
    drawLine(canvas, 20, 140, 220, 140, 'black', 2);

    drawSheetText(canvas, sheetMonth, 30, 130, "22px", 800, "italic", "Arial");
    drawSheetText(canvas, sheetDay, 100, 130, "22px", 800, "italic", "Arial");
    drawSheetText(canvas, sheetYear, 160, 130, "22px", 800, "italic", "Arial");

    drawSheetText(canvas, "(MONTH)", 30, 154, "11px", 800, "normal", "Arial");
    drawSheetText(canvas, "(DAY)", 110, 154, "11px", 800, "normal", "Arial");
    drawSheetText(canvas, "(YEAR)", 170, 154, "11px", 800, "normal", "Arial");


    drawLine(canvas, 300, 140, 500, 140, 'black', 2);
    drawSheetText(canvas, totalMile, 350, 130, "22px", 800, "italic", "Arial");
    drawSheetText(canvas, "(TOTAL MILES DRIVING TODAY)", 300, 154, "11px", 800, "normal", "Arial");

    drawLine(canvas, 900, 140, 1180, 140, 'black', 2);
    drawSheetText(canvas, "VEHICLE NUMBERS-(SHOW EACH UNIT)", 910, 154, "11px", 800, "normal", "Arial");

    drawLine(canvas, 20, 220, 520, 220, 'black', 2);
    drawSheetText(canvas, "(NAME OF CARRIER OR CARRIERS)", 100, 235, "11px", 800, "normal", "Arial");

    drawLine(canvas, 680, 220, 1180, 220, 'black', 2);
    drawSheetText(canvas, "(DRIVER'S SIGNATURE IN FULL)", 830, 235, "11px", 800, "normal", "Arial");

    drawLine(canvas, 20, 300, 520, 300, 'black', 2);
    drawSheetText(canvas, "(MAIN OFFICE ADDRESS)", 120, 310, "11px", 800, "normal", "Arial");

    drawLine(canvas, 680, 300, 1180, 300, 'black', 2);
    drawSheetText(canvas, "(NAME OF CO_DRIVER)", 850, 310, "11px", 800, "normal", "Arial");


  }

  useEffect(() => {
    const canvas = canvasRef.current;
    drawSheet(canvas, totalMile, sheetDay, sheetMonth, sheetYear);

    logs.map((log, index) => {
      drawDailyLogs(canvas, 150, 370 + 460*index, log, day);
    })

    // drawDailyLogs(canvas, 100, 380, logs, day);
  }, [totalHour, dutyType, logs, day]);

  return (
    <div style={{ paddingTop: "20px" }}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={350 + 400 * (day+1) + 300}
        style={{ border: "2px solid black" }}
      />
    </div>
  );
};

export default CanvasComponent;