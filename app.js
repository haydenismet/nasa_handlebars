/* GLOBAL VARIABLES */
var publicFavourites = [];
var dateRef = new Date();
var dateYear = dateRef.getFullYear();
let dateDay = dateRef.getDate();
let dateMonth = dateRef.getMonth() + 1;
console.log(dateRef,dateYear,dateMonth,dateDay);
const yearArray = [2015, 2016, 2017, 2018, 2019, 2020];
const monthsOf = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const daysOf = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

///////////////////* GLOBAL FUNCTIONS *///////////////////

//PAGE LOAD - FIRST VISIT 
fetchCall(
  "https://api.nasa.gov/planetary/apod?date=2020-06-12&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD"
);

// RESET TEMPLATE - USED DURING RERENDER //
function resetTemplate() {
  $("#nasa-template-whole").remove();
}

//DATE FORMATTER HELPER -> HANDLEBARS.HELPER
Handlebars.registerHelper("prettyDate", function (dateInput) {
  let newDate = new Date(dateInput);
  let year = newDate.getFullYear();
  let day = newDate.getDate();
  let month = newDate.getMonth();
  let monthFull = monthsOf[month];
  let days = newDate.getDay();
  let daysWeek = daysOf[days];

  return `${daysWeek} ${day} ${monthFull}, ${year}`;
  
});

// TEXT REGEX TRANSFORM -> First paragraph separated
function transformString(stringy) {
  let regex = /^.*?[\.!\?](?:\s|$)/;
  let firstSentence = stringy.match(regex);
  let remainingSentences = stringy.replace(regex, "");
  let sentenceSplits = [firstSentence, remainingSentences];
  return sentenceSplits;
}

///////////////////* RANDOMIZE DATE FUNCTION *///////////////////

//RANDOMIZE DATE//
async function randomizeDate() {
 
  let randomMonth = Math.floor(Math.random() * 11) + 1;
  let randomYearSelector = Math.floor(Math.random() * yearArray.length);
  let randomYear = yearArray[randomYearSelector];
  let daysInMonth = new Date(randomYear, randomMonth, 0).getDate();
  let randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  let newRandomDate = new Date(randomYear, randomMonth, randomDay);;
  //IF FUTURE DATE
  if (newRandomDate > dateRef) {
    console.log("future date, randomizing again");
    return randomizeDate();
  } else {
    let randomDate = `${randomYear}-${randomMonth}-${randomDay}`;
    return randomDate;
  }
}

///////////////////* DATEPICKER FUNCTIONS *///////////////////

//CLICK PICK DATE LINK
$(".container").on("click", ".apod-link-2", function (e) {
  e.preventDefault();
  $(".apod-bg").css("display", "flex");
  watchDates();
});

//SHOW MONTHS ARRAY
function loopMonths() {
  monthsOf.forEach((month, index) => {
    //console.log(month, index + 1);
    $(".apod-month").append(
      `<option value='${index + 1}' class='apod-year'>${month}</option>`
    );
  });
}
loopMonths();

//SCRAPE USER INPUT DATES
async function scrapeDatesSubmit() {
  console.log("submit date");
  let dayInput = $(".apod-day-select").val();
  let monthInput = $(".apod-month").val();
  let yearInput = $(".apod-year-select").val();
  let chosenDate = `${yearInput}-${monthInput}-${dayInput}`;
  return chosenDate;
}


//is there a way we can consolidate date functions you've created?
function watchDates() {
  //For default date for January 2015 (initial before any change of year or month is registered)
  let testDays = 31;
  let t = 1;
  while (t <= testDays) {
    $(".apod-day-select").append(
      `<option value='${t}' class='apod-day'>${t}</option>`
    );
    t++;
  }

  //For days updated by year picked - will store last chosen date for next month/year picked unless doesnt exist ie 31st in February
  $(".apod-month, .apod-year-select").change(function (e) {
    let dayInput = $(".apod-day-select").val(); //grab inputted day onChange
    $(".apod-day-select").children().remove(); //remove days to re-render days
    e.preventDefault();

    let yearInput = $(".apod-year-select").val(); // grab inputted year
    let monthInput = $(".apod-month").val(); // grab inputted month
    let days = new Date(yearInput, monthInput, 0).getDate(); // calculate days in this month and year, ie feb 2015 28, feb 2016 29. 


    //not to append months/days that don't exist yet.
    let i = 1; //counter ref
    let newestYear = yearArray.length - 1; //grab most current year in the array
    if(yearArray[newestYear] == yearInput && monthInput == dateMonth) { // if year is newest(2020) and userchosen year is 2020, AND theyve picked the current month, then only use the counter up to the present day, i.e August 2020 = TRUE, TODAY date is 16 august, only render days up to 16th else, continue appending from code above to calculate days of month in chosen month/year.
      while(i <= dateDay) {
        $(".apod-day-select").append(
          `<option value='${i}' class='apod-day'>${i}</option>`
        );
        i++;
      }
    } else {
      while (i <= days) {
        $(".apod-day-select").append(
          `<option value='${i}' class='apod-day'>${i}</option>`
        );
        i++;
      }
    }

    //retain last picked day (unless doesnt exist then previous code removes it);
    $(".apod-day-select").val(dayInput);
  });
}

//SUBMIT SELECTED DATE
$(".apod-date-form").on("submit", function (e) {
  e.preventDefault();
  $(".apod-bg").css('display', 'none');
  resetTemplate();
  scrapeDatesSubmit()
    .then((result) => {
      return `https://api.nasa.gov/planetary/apod?date=${result}&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD`;
    })
    .then((url) => fetchCall(url));
});

///////////////////* LINK FUNCTIONS/CALLS *///////////////////

//TODAYS APOD LINK
$(".container").on("click", ".apod-link-1", function (e) {
  e.preventDefault();
  let fetchTodayURL =
    "https://api.nasa.gov/planetary/apod?api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD";
  resetTemplate();
  fetchCall(fetchTodayURL);
});

//RANDOMIZE DATE LINK CLICKED
$(".container").on("click", ".apod-link-3", function (e) {
    e.preventDefault();
    resetTemplate();
    randomizeDate()
      .then((result) => {
        return `https://api.nasa.gov/planetary/apod?date=${result}&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD`;
      })
      .then((url) => fetchCall(url));
  });


  function removeDatePicker() {
  $(".apod-x").on('click', function(e) {
      e.preventDefault();
      $(".apod-bg").css('display', 'none');
  });
  } 

  removeDatePicker();
///////////////////* FAVOURITES FUNCTIONS/CALLS *///////////////////

//FAVOURITES TAB LINK
$(".container").on("click", ".apod-link-4", function (e) {
  e.preventDefault();
  let favouriteData = publicFavourites;
  //console.log(favouriteData);
  resetTemplate();
  favouriteCall(favouriteData);
});

//RENDER FAVOURITES DATA (Like fetch but for favourite tab)
function favouriteCall(favObject) {
  let source = $("#nasa-app-fav-template").html();
  let template = Handlebars.compile(source);
  let html = template(favObject);
  $(".container").append(html);
}

//GO HOME FROM FAVOURITES TAB
$(".container").on("click", ".apod-logo-fav", function (e) {
  e.preventDefault();
  let fetchTodayURL =
    "https://api.nasa.gov/planetary/apod?api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD";
  //console.log(fetchTodayURL);
  resetTemplate();
  fetchCall(fetchTodayURL);
});

///////////////////* GENERIC FETCH *///////////////////

//GENERIC FETCH CALL FOR USE/TEMPLATE - gets passed URL dependent on links clicked and also default renders zoom and heart icons for each image
function fetchCall(url) {
  //console.log("fetching");
  $(".container").append(
    "<img src='785.gif' alt='loading' class='apod-spinner'>"
  );
  //pick a date functionality -> remaining is to only allow for this year up to this month ie 2020 up to August 9th, no further. 
  //mobile responsive
  //compare photos with photos within the publicFavourites array, if its been liked you can't add it again. add remove functionality later
  //https://api.nasa.gov/planetary/apod?start_date=2020-06-12&end_date=2020-06-15&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD
  //https://api.nasa.gov/planetary/apod?date=2020-06-12&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD
  //https://api.nasa.gov/planetary/apod?api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
      let { date, explanation, title, url, media_type, copyright, service_version, ...rest } = data;
      // console.log(explanation);
      // console.log(explanation);
      let explanationSplit = transformString(explanation);

      let source = $("#nasa-app-template").html();
      let template = Handlebars.compile(source);

      let context = {
        apodTitle: title,
        apodDate: date,
        apodURL: url,
        apodDescOpener: explanationSplit[0],
        apodDescRemaining: explanationSplit[1],
        apodCopyright: rest.copyright,
        apodMediaType:media_type,
        apodCopyright:copyright,
        apodVersion:service_version,
      };

      if (media_type === "video") {
        console.log("youtube link");
        context = {
          apodTitle: title,
          apodDate: date,
          apodVid: url,
          apodDescOpener: explanationSplit[0],
          apodDescRemaining: explanationSplit[1],
          apodMediaType:media_type,
          apodCopyright:copyright,
          apodVersion:service_version,
        };
      }

      // console.log(context);
      $(".apod-spinner").remove();
      let html = template(context);
      $(".container").append(html);

      //EXPAND IMAGE
      $(".icon__search").on("click", function (e) {
        e.preventDefault();
        let loadedImg = $("#apod-img").attr("src");
        $(".modal, .apod-img-expanded").css("display", "flex");
        $(".apod-img-expanded").html(
          `<img src=${loadedImg} class='apod-expanded-src'>`
        );
        $(".apod-expanded-src").css("display", "flex");
      });

      //CLOSE EXPAND
      $(".modal, .apod-img-expanded, .apod-expanded-src").on("click", function (
        e
      ) {
        e.preventDefault();
        $(".modal, .apod-img-expanded, .apod-expanded-src").hide();
      });

      //HEART ICON
      $(".icon__heart").one("click", function (e) {
        e.preventDefault();
        $(".fa-heart").css("color", "#f78ba6");
        publicFavourites.push(data);
        publicFavourites.forEach((apod) => {
          apod.favouritedPic = true;
          //  console.log(apod);
        });
      });
    });
}


