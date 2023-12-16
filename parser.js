try {
    const fs = require('fs');
    let jsonData = fs.readFileSync('./mochawesome-report/mochawesome.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(data)
    });
    console.log(JSON.stringify(jsonData));
} catch (err) {
    console.log('Error in parsing JSON file: ', err)
}