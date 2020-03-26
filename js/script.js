document.addEventListener('DOMContentLoaded', function () {

    // API Key from OpenWeatherMap API
    const apiKey = 'e3ced3b225b136b4bf36fda573bd4cc9'


    // Grab necessary html elements
    const searchField = document.querySelector('#user-input')
    const searchBtn = document.querySelector('#search-Btn')
    const cityList = document.querySelector('ul')
    const current = document.querySelector('#current')
    const currentDate = document.querySelector('#current-date')
    const currentTemp = document.querySelector('#current-temp')
    const currentHumidity = document.querySelector('#current-humidity')
    const currentWind = document.querySelector('#current-wind')
    const currentUV = document.querySelector('#uv-number')


    // Object to store data collected from API's
    const currentWeather = {
        date: '',
        hour: '',
        city: '',
        country: '',
        temperature: {
            value: '',
            unit: ''
        },
        humidity: '',
        windSpeed: '',
        description: '',
        iconID: '',
        latitude: '',
        longitude: '',
        uv: ''
    }

    // Function to create list for searched cities
    const listCreator = (searchItem) => {
        let item = document.createElement('li')
        item.classList.add("list-group-item")
        item.textContent = searchItem
        item.addEventListener('click', clickableLists)
        cityList.appendChild(item)
    }

    // Event Listener Function for searched list items 
    const clickableLists = (event) => {
        const item = event.target.textContent
        // Clean 5-days forecast cards
        let cards = document.querySelectorAll('.days')
        for (i = 0; i < cards.length; i++) {
            cards[i].innerHTML = ''
        }
        // Using list content, execute weather()
        weather(item)
    }

    // Function to access the Current Weather API
    const weather = async (searchCity) => {
        let url = 'https://api.openweathermap.org/data/2.5/weather?q=' + searchCity + '&appid=' + apiKey + '&units=imperial'

        fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                // Get api values and store in the currentWeather object
                currentWeather.date = new Date(data.dt * 1000).toLocaleDateString("en-US")
                currentWeather.city = data.name
                currentWeather.country = data.sys.country
                currentWeather.latitude = data.coord.lat
                currentWeather.longitude = data.coord.lon
                currentWeather.temperature.value = Math.floor(data.main.temp)
                currentWeather.humidity = data.main.humidity
                currentWeather.windSpeed = data.wind.speed
                currentWeather.description = data.weather[0].description
                currentWeather.iconID = data.weather[0].icon
                let source = 'https://openweathermap.org/img/wn/' + currentWeather.iconID + '@2x.png'
                current.textContent = currentWeather.city 
                currentDate.innerHTML = ' (' + currentWeather.date + ')' + '<img src=' + source + ' width = "10%">'
                currentTemp.textContent = currentWeather.temperature.value
                currentHumidity.textContent = currentWeather.humidity
                currentWind.textContent = currentWeather.windSpeed
            })
            .then(() => {
                uv(currentWeather.latitude, currentWeather.longitude)
            })
            .then(() => {
                forecast(currentWeather.city)
            })
    }

    // Function to access the UV Index API
    const uv = (latitude, longitude) => {

        let url = 'https://api.openweathermap.org/data/2.5/uvi?&appid=' + apiKey + '&lat=' + latitude + '&lon=' + longitude

        fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                currentWeather.uv = data.value
                roundedUV = Math.round(currentWeather.uv)
                // Conditions to color code UV index based on returned value
                let uvClass = ''
                if (roundedUV >= 0 && roundedUV < 3) {
                    uvClass = 'btn-success'
                    currentUV.classList.remove('btn-warning')
                    currentUV.classList.remove('btn-danger')
                    currentUV.classList.add(uvClass)
                } else if (roundedUV >= 3 && roundedUV < 8) {
                    uvClass = 'btn-warning'
                    currentUV.classList.remove('btn-success')
                    currentUV.classList.remove('btn-danger')
                    currentUV.classList.add(uvClass)
                } else if (roundedUV >= 8) {
                    uvClass = 'btn-danger'
                    currentUV.classList.remove('btn-warning')
                    currentUV.classList.remove('btn-success')
                    currentUV.classList.add(uvClass)
                } else {
                    return
                }
                currentUV.textContent = currentWeather.uv
                return currentWeather
            })
    }

    // Filters the API list object to get current day, and current hour and re-use result
    const getHours = (filterCurrentDays, currentDay) => {
        let result = []
        const currentHour = currentDay.getHours()
        for (let i = 0; i < filterCurrentDays.length; i++) {
            const context = new Date(filterCurrentDays[i].dt_txt).getHours()
            const diff = Math.abs(Number(currentHour) - Number(context))
            if (diff >= 0 && diff < 3) result.push(filterCurrentDays[i])
        }
        return result[0]
    }

    // Function to access the 5-Days Forecast API
    const forecast = (city) => {
        let url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + apiKey + '&units=imperial'

        fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                // Date values for 5-day forecast cards
                let val1 = new Date(Date.now() + 86400000)
                let val2 = new Date(Date.now() + (86400000 * 2))
                let val3 = new Date(Date.now() + (86400000 * 3))
                let val4 = new Date(Date.now() + (86400000 * 4))
                let val5 = new Date(Date.now() + (86400000 * 5))

                let values = [val1, val2, val3, val4, val5]

                let allDays = document.querySelectorAll('.days')

                // Render all the 5 cards and append necessary content
                const renderCards = () => {
                    const list = data.list
                    for (let j = 0; j < allDays.length; j++) {
                        const currentDay = values[j]
                        const filterCurrentDays = list.filter(current => new Date(current.dt_txt).getDate() === currentDay.getDate())
                        const context = getHours(filterCurrentDays, currentDay)
                        const date = new Date(context.dt_txt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                        let p1 = document.createElement('p')
                        p1.textContent = date
                        p1.classList.add('font-weight-bold')
                        allDays[j].appendChild(p1)

                        // loop through api list using below index formula that gets every 8th weather array
                        let index = 7 * (j + 1) + j

                        // append weather icons
                        let p2 = document.createElement('img')
                        let iconCode = data.list[index].weather[0].icon
                        let source = 'https://openweathermap.org/img/wn/' + iconCode + '@2x.png'
                        p2.setAttribute('src', source)
                        p2.style.width = "40%";
                        allDays[j].appendChild(p2)

                        // append temperature
                        let p3 = document.createElement('p')
                        p3.innerHTML = 'Temp: ' + Math.floor(data.list[index].main.temp) + ' &#8457'
                        allDays[j].appendChild(p3)

                        // append humidity
                        let p4 = document.createElement('p')
                        p4.innerHTML = 'Humidity: ' + data.list[index].main.humidity + '%'
                        allDays[j].appendChild(p4)
                    }
                }
                renderCards()
            })
    }

    // Function to render search results
    const appRender = (event) => {
        event.preventDefault()

        let cards = document.querySelectorAll('.days')
        for (i = 0; i < cards.length; i++) {
            cards[i].innerHTML = ''
        }
        // Get user input 
        let searchCity = ''
        if (searchField.value) {
            searchCity = searchField.value[0].toUpperCase() + searchField.value.slice(1).toLowerCase()
        } else {
            return
        }

        // Save search to local storage
        localStorage.setItem('city', searchCity)

        // Empty input field after search
        searchField.value = ''

        // create search list
        listCreator(searchCity)

        // Call accessAPI function
        weather(searchCity)
    }

    // AJAX call to retrieve data
    searchBtn.addEventListener('click', appRender)

    // On page re-load render with local storage value, but NOT with empty value
    const lastCity = localStorage.getItem('city')
    if (lastCity) {
        weather(lastCity)
    } else {
        return
    }

}, false);