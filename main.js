window.location.hash = '#';

// mode switch
const toggler = document.querySelector('.mode-switch');
toggler.addEventListener('click',()=>{
    document.body.classList.toggle('light');
});

// dropdown
const filterBtn = document.getElementById('filter');
filterBtn.addEventListener('click', () => {
	filterBtn.classList.toggle('open');
});

// global selectors
const countryContainer = document.querySelector('.countries-list');
const main = document.querySelector('main');
const modalContainer = document.querySelector('.detailed-country-data');
const contentContainer = document.querySelector('.container');

// load spinner
const loader = document.querySelector('.ring');
function showLoader(){
    loader.style.display = 'block';
}
function hideLoader(){
    loader.style.display = 'none';
}

// API stuff
getCountries();
async function getCountries(){
    showLoader();
    let serverData = await fetch('https://restcountries.com/v3.1/all');
    let jsonData = await serverData.json();
    hideLoader();
    displayCountries(jsonData);
}

function displayCountries(data){
    data.forEach(country => {
        const countryHTML = document.createElement('div');
        countryHTML.classList.add('country');
        countryHTML.innerHTML = `
        <a href="#${country.name.common}">
            <div class="country-flag">
                <img src="${country.flags.png}" alt="country-flag">
            </div>
            <div class="country-details">
                <h2><b>${country.name.common}</b></h2>
                <div>Population:<span>${country.population}</span></div>
                <div class="region">Region:<span>${country.region}</span></div>
                <div>Capital:<span>${country.capital}</span></div>
            </div>
        </a>
        `;
        countryContainer.appendChild(countryHTML);
    });
}

// search
let searchBox = document.getElementById('search');

searchBox.addEventListener('keyup',(e)=>{
    if(e.keyCode == 13){
        let searchValue = e.target.value;
        console.log(searchValue);
        if(searchValue === ''){
            getCountries();
            return;
        }
        const toDelete = document.querySelectorAll('.country');
        for(let i=0;i<toDelete.length;i++){
            toDelete[i].remove();
        }
        searchForCountry(searchValue);
    }
    
});

async function searchForCountry(name){
    showLoader();
    let serverData = await fetch(`https://restcountries.com/v3.1/name/${name}`);
    let jsonData = await serverData.json();
    hideLoader();
    displayCountries(jsonData);
}

const regions = filterBtn.querySelectorAll('li');
regions.forEach(filter => {
    filter.addEventListener('click',(e)=>{
        let val = filter.innerText;
        const countryRegion = document.querySelectorAll('.region');
        countryRegion.forEach(item => {
            if(item.innerText.includes(val) || val==='All'){
                item.closest('.country').style.display = 'block';
            }
            else{
                item.closest('.country').style.display = 'none';
            }
        })
    });
});

window.addEventListener('hashchange',(e)=>{
    loadHash();
});

function loadHash(){
    if(!(window.location.hash == '')){
        let hash = window.location.hash.substring(1);
        findThisCountry(hash);
    }
    else{
        getCountries();
    }
}

async function findThisCountry(hash){
    console.log(hash);
    showLoader();
    let serverData = await fetch(`https://restcountries.com/v3.1/name/${hash}`);
    let jsonData = await serverData.json();
    hideLoader();
    displayDetailedCountry(jsonData);
}

async function displayDetailedCountry(country){
    contentContainer.style.display = "none";
    modalContainer.innerHTML = '';
    modalContainer.style.display = 'block';
    const ele = document.createElement('div');
    ele.innerHTML = await detailedViewHTML(country[0]);
    console.log(country[0].borders);
    let borderArr = country[0].borders;
    if(borderArr){
        borderArr.forEach((ele)=>{
            getCountryByBorder(ele);
        });
    }
    modalContainer.appendChild(ele);
}

function detailedViewHTML(country){
    console.log(country);
    console.log(country.currencies);
    const html = `
    <div class = 'detail-container'>
    <button id='back-button' onclick='closeDetailView()'><i class="fas fa-long-arrow-alt-left"></i>Back</button>
    <div class='detail-content'>
        <div class='detail-flag-container'>
            <img class='detail-flag' src="${country.flags.png}" alt="country-flag"/>
        </div>
        <div class='detail-stats-main-container'>
            <h1 class='detail-page-name'>${country.name.common}</h1>
            <div class='detail-stats-container'>
                <ul class='detail-stats-list' id='list-1'>
                    <li>
                        <span class='detail-stat-title'>Native Name: </span>
                        <span class='detail-stat-text'>
                        ${Object.values(country.name.nativeName)[0].common}
                        </span>
                    </li>
                    <li>
                        <span class='detail-stat-title'>Population: </span>
                        <span class='detail-stat-text'>${country.population}</span>
                    </li>
                    <li>
                        <span class='detail-stat-title'>Region: </span>
                        <span class='detail-stat-text'>${country.region}</span>
                    </li>
                    <li>
                        <span class='detail-stat-title'>Sub Region: </span>
                        <span class='detail-stat-text'>${country.subregion}</span>
                    </li>
                    <li>
                        <span class='detail-stat-title'>Capital: </span>
                        <span class='detail-stat-text'>${country.capital}</span>
                    </li>
                </ul>
                <ul class='detail-stats-list' id='list-2'>
                    <li><span class='detail-stat-title'>Top Level Domain: </span>
                        <span class='detail-stat-text'>${country.tld[0]}</span>
                    </li>
                    <li>
                        <span class='detail-stat-title'>Currencies: </span>
                        <span class='detail-stat-text'>${Object.values(country.currencies)[0].name}</span>
                    </li>
                    <li>
                        <span class='detail-stat-title'>Languages: </span>
                        <span class='detail-stat-text'>${Object.values(country.languages).join(", ")}</span>
                    </li>
                </ul>
            </div>
            <div class='detail-border-countries-container'>
                <span class='detail-border-countries-title'>
                    <h1>Border Countries:</h1>
                    
                </span>
            </div>
            </div>
        </div>
        </div>
    `;
    return html;
}

async function getBorderCountry(code){
    showLoader();
    const serverData = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
    const jsonData = await serverData.json();
    if(serverData.ok){
        hideLoader();
        return jsonData;
    }
    else{
        hideLoader();
        window.alert("error!!");
    }
}

async function getCountryByBorder(border){
    const borderDetail = await getBorderCountry(border);
    let ele = document.createElement('a');
    ele.classList.add('detail-border-country-button');
    ele.setAttribute('href', `#${borderDetail[0].name.common}`);
    console.log(borderDetail[0].name.common);
    ele.textContent = borderDetail[0].name.common;
    document.querySelector('.detail-border-countries-title').appendChild(ele);
}

function handleBorder(codes){
    if(!codes){
        return "none";
    }
    else{

        codes.forEach((ele)=>{
            getCountryByBorder(codes);

        });
        
    }
}

function getCurrencies(obj){
    console.log(obj);
    let ans = '';
    for(let i=0;i<obj.length;i++){
        console.log(ans);
        ans+=i.name;
        ans+=' ';
    }
    return ans;
}

function closeDetailView() {
    window.location.href = "#";
    modalContainer.style.display = "none";
    contentContainer.style.display = 'block';
}