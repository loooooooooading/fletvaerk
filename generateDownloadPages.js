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
            html, body {margin: 0; height: 100%; overflow: hidden; width:100%}

            .textSize {
                font-size: 72px;
            }
            .contentBar {
                height: 7vh;
            }
            .logoHeight {
                height: 65px;
            }
            .descriptorFontSize {
                font-size: 24px;
            }
            @media (min-width:768px) {
                .textSize {
                    font-size: 60px;
                }
                .contentBar {
                    height: 6vh;
                }
                .logoHeight {
                    height: 60px;
                }
                .descriptorFontSize {
                    font-size: 24px;
                }
            }
            @media (min-width:1024px) {
                .textSize {
                    font-size: 36px;
                }
                .contentBar {
                    height: 5.5vh;
                }
                .logoHeight {
                    height: 45px;
                }
                .descriptorFontSize {
                    font-size: 16px;
                }
            }
            @media (min-width:1280px) {
                .textSize {
                    font-size: 30px;
                }
                .contentBar {
                    height: 5.5vh;
                }
                .logoHeight {
                    height: 40px;
                }
            }
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
                max-width: 125%;
                max-height: 125vh;
                margin: auto;
            }
        </style>
    </head>
    <body style="margin: 0;"  >
    <main style="width:100%">
        <div class="imgbox">
            <img class="center-fit" src="./heartRenders/${date}—${name}.png" alt="a purple and white woven heart pattern render">
        </div>
        <h1 class="textSize" style=" z-index: 10; color:white; position:fixed; bottom: 1vh; left: 1vh; font-family: Arial, Helvetica, sans-serif;">${name}</h1>
        <a class="textSize" href="./patterns/${date}—${name}.pdf" style="z-index: 10; position:fixed; bottom: 1vh; right: 1vh; text-align: right;  color:white; display: flex; font-family: Arial, Helvetica, sans-serif;"> <img class="logoHeight" style="width: auto; margin-right: 5px; filter: invert(1);" src="./Arrow_Down.svg"> Download </a>

        <div class="contentBar" style="position: fixed; bottom: 0; left: 0; width: 100%;  padding: 5px; background: rgb(${color[0]}, ${color[1]}, ${color[2]});">
            <div class="descriptorFontSize" style="position:relative; width:100%; height:100%">
                <div style="position: absolute; top: -2.5rem; left: 0; width: 100%; height: 1rem; padding: 5px;">
                    <a href="https://www.loooading.com/" style="color:black;">LOOOADING</a> © 2022 — <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" style="black: white;">BY-NC-SA 4.0</a>
                </div>
                <div style="position: absolute; top: -2.5rem; right: 1vh; height: 1rem; padding: 5px;">
                    <span style="font-family: Arial, Helvetica, sans-serif;" >${date}</span>
                </div>
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