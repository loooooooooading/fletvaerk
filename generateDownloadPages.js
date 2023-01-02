var Vibrant = require('node-vibrant')
const fs = require('fs');

const patternList = [
    {
        name: "h.c.hjerte",
        date: "01-12-2022"
    },
    {
        name: "cirkelhjerte",
        date: "02-12-2022"
    },
    {
        name: "fleurhjerte",
        date: "03-12-2022"
    },
    {
        name: "dråbeflammehjerte",
        date: "04-12-2022"
    },
    {
        name: "ruderhjerte",
        date: "05-12-2022"
    },
    {
        name: "citronhjerte",
        date: "06-12-2022"
    },
    {
        name: "bingodopperhjerte",
        date: "07-12-2022"
    },
    {
        name: "firbåndhjerte",
        date: "08-12-2022"
    },
    {
        name: "alhambrav0hjerte",
        date: "09-12-2022"
    },
    {
        name: "rorsachhjerte",
        date: "10-12-2022"
    },
    {
        name: "trehjerte",
        date: "11-12-2022"
    },
    {
        name: "kirsebærkyshjerte",
        date: "12-12-2022"
    },
    {
        name: "solhjulhjerte",
        date: "13-12-2022"
    },
    {
        name: "nordstjernehjerte",
        date: "14-12-2022"
    },
    {
        name: "leveluphjerte",
        date: "15-12-2022"
    },
    {
        name: "alhambrahjerte2",
        date: "16-12-2022"
    },
    {
        name: "tesselationshjerte1",
        date: "17-12-2022"
    },
    {
        name: "larvebidhjerte",
        date: "18-12-2022"
    },
    {
        name: "bjørnehjerte",
        date: "19-12-2022"
    },
    {
        name: "rebhjerte",
        date: "20-12-2022"
    },
    {
        name: "firstjernehjerte",
        date: "21-12-2022"
    },
    {
        name: "krydssøjlehjerte",
        date: "22-12-2022"
    },
    {
        name: "quatrofoilhjerte",
        date: "23-12-2022"
    },
    {
        name: "julestjernehjerte2022",
        date: "24-12-2022"
    },
]

function generateTextFileContnts(date, name, color){
    return `<!DOCTYPE html>
    <head>
        <style>
            * {
                margin: 0;
                padding: 0;
            }
            .imgbox {
                position: absolute;
                top: -15vh;
                display: grid;
                height: 100%;
                width:100%;
            }
            .center-fit {
                max-width: 100%;
                max-height: 125vh;
                margin: auto;
            }
        </style>
    </head>
    <body style="margin: 0;">
    <main style="">
        <div class="imgbox">
            <img class="center-fit" src="./heartRenders/${date}—${name}.png" alt="a purple and white woven heart pattern render">
        </div>
        <div style="position: fixed; bottom: 2.5rem; left: 0; width: 100%; height: 1rem; padding: 5px;">
            <a href="https://www.loooading.com/" style="color:black;">LOOOADING</a> © 2022 — <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" style="black: white;">BY-NC-SA 4.0</a>
        </div>
        <div style="position: fixed; bottom: 0; left: 0; width: 100%; height: 1.75rem; padding: 5px; background: rgb(${color[0]}, ${color[1]}, ${color[2]});">
            <div style="display: grid; grid-template-columns: 3fr 1fr 1fr; color: white;">
                <h1 style="font-size:x-large; font-family: Arial, Helvetica, sans-serif;">${name}</h1>
                <p style="font-size:x-large; font-family: Arial, Helvetica, sans-serif;" >${date}</p>
                <a href="./patterns/${date}—${name}.pdf" style=" color:white; display: flex; font-size:x-large; font-family: Arial, Helvetica, sans-serif;"> <img style="height: 30px; width: auto; margin-right: 5px; filter: invert(1);" src="./Arrow_Down.svg"> Download </a>
            </div>
        </div>
    </main>
    </body>`
}

patternList.forEach(pattern => {
    Vibrant.from(`./public/heartRenders/${pattern.date}—${pattern.name}.png`).getPalette((err, palette) => {
        if(err === undefined){
            const color = palette.DarkVibrant._rgb
            fs.writeFile(`./public/${pattern.date}—${pattern.name}.html`, generateTextFileContnts(pattern.date, pattern.name, color), function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log(`${pattern.date}—${pattern.name}.html was saved!`);
            }); 
        } else {
            console.log(err)
        }        
    })
    
})