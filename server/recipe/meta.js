const fs = require('fs');
let fn = ""
if (process.argv.length === 4) {
    fn = process.argv[3]
} else {
    process.exit(1)
}
fs.writeFileSync(fn, JSON.stringify({
    "Zonk": {
        "Honk": "henk"
    },
    "plugin-example": {
        "chat-gpt": {
            "fields": {
                "filename": "trabant.jpg",
                "description": {
                    "de-DE": "Das Bild zeigt ein Gemälde eines weißen Trabant-Autos, das durch eine Wand bricht. Die Illusion von zerbrochenem Putz und Ziegeln verstärkt den Eindruck einer Durchbrechung. Auf dem Nummernschild steht 'NOV 9-89', ein Hinweis auf den Tag des Mauerfalls in Berlin. Das Kunstwerk ist von Birgit Kinder signiert.",
                    "en-US": "The image shows a painting of a white Trabant car breaking through a wall. The illusion of broken plaster and bricks enhances the impression of the car crashing through. The license plate reads 'NOV 9-89', referencing the date of the Berlin Wall's fall. The artwork is signed by Birgit Kinder."
                },
                "keywords": [
                    {
                        "de-DE": "Trabant",
                        "en-US": "Trabant"
                    },
                    {
                        "de-DE": "Berlin",
                        "en-US": "Berlin"
                    },
                    {
                        "de-DE": "Mauer",
                        "en-US": "Wall"
                    },
                    {
                        "en-US": "Art"
                    },
                    {
                        "de-DE": "Wand",
                        "en-US": "Crash"
                    },
                    {
                        "de-DE": "Durchbruch",
                        "en-US": "Breakthrough"
                    },
                    {
                        "de-DE": "Mauerfall",
                        "en-US": "Wall Fall"
                    },
                    {
                        "de-DE": "Illusion",
                        "en-US": "Illusion"
                    },
                    {
                        "de-DE": "Birgit Kinder",
                        "en-US": "Birgit Kinder"
                    },
                    {
                        "de-DE": "Auto",
                        "en-US": "Car"
                    }
                ],
                "title": {
                    "de-DE": "Auto durch die Mauer",
                    "en-US": "Car Breaking Through Wall"
                }
            },
            "timestamp": "2024-10-18T13:15:11+02:00"
        }
    },
    "_fulltext": {
        "text": ["horst sieht torsten"]
    },
    "_technical_metadata": {
        "huhu": {
            "gut": "sieht torsten"
        }
    }
}))
console.log("wrote file", fn)
