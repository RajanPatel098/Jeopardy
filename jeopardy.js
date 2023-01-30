
// categories is the main data structure for the app; it looks like this:
///- array remove will return an array minus the value at
// the specified index
function arrayRemove(arr, value) { 
    return arr.filter(function(el){ 
        return el != value; 
    });
}
///-return a random integer between 0 and the specified
//number - 1
function getRandomOf(number){
    return Math.floor(Math.random() * number);
}
///-get a number of random elements from specified
// array without duplicates
function sampleArray(arr, number){
    let copy = [...arr];
    let back = [];
    for(let count = 0; count < number; count++){
        const randomElement = getRandomOf(copy.length);    
        back.push(copy[randomElement]);
        copy = arrayRemove(copy,copy[randomElement]);           
    }
    return back;
}


let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    ///-empty categories array for restarts
    categories = [];
    ///-get 99 categories from api
    const response = await axios.get(
        "http://jservice.io/api/categories?count=99"
    );
    let allCategories = response.data;
    ///-randomly select six for current game
    let data = sampleArray(allCategories,6);
    ///-add to categories array
    for(let datum of data){
        categories.push(datum);
    }

    //console.log('categories',categories);
}

let clues = [];
///-fill clues array with 5 clues from all categories
async function getClues(){
    ///-empty clues array for restarts
    clues = [];
    ///-get 6 sets of 5 clues from categories returned by getCategoryIds()
    //and push them into clues array
    for(let count = 0; count < 6; count++){
        let category = await getCategory(categories[count].id);
        clues.push(category);
    }
    //console.log('clues',clues);
}


async function getCategory(catId) {
    const response = await axios.get(
        `http://jservice.io/api/category?id=${catId}`
    );   
    return response;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    ///-display category titles
    //empty clues and category elements for restarts
    let categoriesElement = document.getElementById('categories');
    categoriesElement.innerHTML = '';
    let cluesElement = document.getElementById('clues');
    cluesElement.innerHTML = '';
    for(let count = 0; count < 6; count++){
        let td = document.createElement("td");
        ///-retrive 6 categories and place them across
        //top of table
        td.textContent = categories[count].title;
        categoriesElement.appendChild(td);
    }
    ///-set up 'clue screens'
    //ids set to row and column to determine which screen
    //a user clicks on and display '?'
    for(let rows = 0; rows < 5; rows++){
        let row = document.createElement('tr');
        cluesElement.appendChild(row);
        row.id=`${rows}`;
        for(let cols = 0; cols < 6; cols++){
            let screen = document.createElement('td');
            screen.id = `${rows}${cols}`;
            screen.setAttribute('data-showing','null');
            screen.innerHTML = "?";
            row.appendChild(screen);
        }
    }
}


/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const clickedScreen = evt.target;
    ///-first number in id is clue number
    const categoryNum = clickedScreen.id[1]; //console.log(categoryNum);
    ///-second number is category number
    const clueNum = clickedScreen.id[0]; //console.log(clueNum);
    ///-return the clue from the clues array
    const clue = getClueNumber(categoryNum,clueNum);
    ///-data-attribute set to not 'null' (unclicked)
    //question (one click)
    //answer (two clicks)
    //unchanged on subsequent clicks
    const showing = clickedScreen.getAttribute('data-showing');
    switch(showing){
        ///-unclicked 
        case 'null': ///-would not work with regular null
            clickedScreen.setAttribute('data-showing','question');
            clickedScreen.innerHTML = clue.question;
        break;
        ///-one click
        case 'question':
            clickedScreen.setAttribute('data-showing','answer');
            clickedScreen.innerHTML = clue.answer;
        break;
        ///-two clicks
        case 'answer':
            ///-ignore further clicks
        break;
        default:///-should not fire
            console.log('something somewhere went horribly wrong');
    }
    
}
function getClueNumber(categoryNum,clueNum){
    return clues[categoryNum].data.clues[clueNum];
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    document.getElementById('jeopardy').style.visibility = 'hidden';
    document.getElementById('loader').classList.add('loader');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    document.getElementById('loader').classList.remove('loader');
    document.getElementById('jeopardy').style.visibility = 'visible';
}


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let cluesElement = document.getElementById('clues');
    cluesElement.addEventListener('click',handleClick);
    showLoadingView();
    await getCategoryIds();
    await getClues();
    await fillTable();
    await getClues();
    hideLoadingView();
}
setupAndStart();

document.getElementById('restart').addEventListener('click',setupAndStart);
  