////////////////* GLOBAL VARIABLES *////////////

var publicFavourites = [];
const dateRef = new Date();
const dateYear = dateRef.getFullYear();
const dateDay = dateRef.getDate();
const dateMonth = dateRef.getMonth() + 1;
const yearArray = [2015, 2016, 2017, 2018, 2019, 2020];
const newestYear = yearArray.length - 1; //grab most current year in the array
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

///////////////////* INIT & GLOBALS *///////////////////

//PAGE LOAD - FIRST VISIT
fetchCall(
  "https://api.nasa.gov/planetary/apod?date=2020-06-12&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD"
);

// RESET TEMPLATE - USED DURING RERENDER //
function resetTemplate() {
  $("#nasa-template-whole").remove();
}

//SHOW MONTHS ALL MONTHS ARRAY DURING CHANGE ie 2020
function loopMonths() {
  monthsOf.forEach((month, index) => {
    $(".apod-month").append(
      `<option value='${index + 1}' class='apod-year'>${month}</option>`
    );
  });
}

//DATE FORMATTER HELPER -> HANDLEBARS.HELPER
//CAN YOU USE THE GLOBAL FUNCS FROM THIS
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

//RANDOMIZE DATE//
async function randomizeDate() {
  let randomMonth = Math.floor(Math.random() * 11) + 1;
  let randomYearSelector = Math.floor(Math.random() * yearArray.length);
  let randomYear = yearArray[randomYearSelector];
  let daysInMonth = new Date(randomYear, randomMonth, 0).getDate();
  let randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  let newRandomDate = new Date(randomYear, randomMonth, randomDay);
  //IF FUTURE DATE
  if (newRandomDate > dateRef) {
    console.log("future date, randomizing again");
    return randomizeDate();
  } else {
    let randomDate = `${randomYear}-${randomMonth}-${randomDay}`;
    return randomDate;
  }
}

//SCRAPE USER INPUT DATES
async function scrapeDatesSubmit() {
  console.log("submit date");
  let dayInput = $(".apod-day-select").val();
  let monthInput = $(".apod-month").val();
  let yearInput = $(".apod-year-select").val();
  let chosenDate = `${yearInput}-${monthInput}-${dayInput}`;
  return chosenDate;
}

//RENDER FAVOURITES DATA (Like fetch but for favourite tab)
function favouriteCall(favObject) {
  let source = $("#nasa-app-fav-template").html();
  let template = Handlebars.compile(source);
  let html = template(favObject);
  $(".container").append(html);
}

function watchDates() {
  //For days to be updated by year picked - will store last chosen date for next month/year picked unless doesnt exist ie 31st in February
  $(".apod-month, .apod-year-select").change(function (e) {
    let dayInput = $(".apod-day-select").val(); //grab inputted day onChange
    $(".apod-day-select").children().remove(); //remove days to re-render days
    e.preventDefault();
    let i = 1; //counter ref
    let monthInput = $(".apod-month").val(); // grab inputted month
    let yearInput = $(".apod-year-select").val(); // grab inputted year
    let days = new Date(yearInput, monthInput, 0).getDate(); // calculate days in this month and year, ie feb 2015 28, feb 2016 29.

    if (yearArray[newestYear] == yearInput) {
      $(".apod-month").children().remove(); //remove months to rerender months. if selected year is the newest, only show up to current month.
      let d = 0;
      while (monthsOf[d] !== monthsOf[dateMonth]) {
        d++;
        $(".apod-month").append(
          `<option value='${d}' class='apod-year'>${monthsOf[d - 1]}</option>`
        );
      }
    } else {
      $(".apod-month").children().remove(); //remove months to rerender months. else, show all months,
      loopMonths();
    }

    if (yearArray[newestYear] == yearInput && monthInput == dateMonth) {
      // if year is newest(2020) and userchosen year is 2020, AND theyve picked the current month, then only use the counter up to the present day, i.e August 2020 = TRUE, TODAY date is 16 august, only render days up to 16th else, continue appending from code above to calculate days of month in chosen month/year.
      while (i <= dateDay) {
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
    $(".apod-month").val(monthInput);
  });
}

///////////////////* CLICK FUNCTIONS *///////////////////

//CLICK PICK DATE LINK
$(".container").on("click", ".apod-link-2", function (e) {
  e.preventDefault();
  $(".apod-bg").css("display", "flex");
  watchDates();
});

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
  $(".apod-x").on("click", function (e) {
    e.preventDefault();
    $(".apod-bg").css("display", "none");
  });
}
removeDatePicker();

//FAVOURITES TAB LINK
$(".container").on("click", ".apod-link-4", function (e) {
  e.preventDefault();
  resetTemplate();
  favouriteCall(publicFavourites);
  if(publicFavourites.length != 0) {
    console.log("longerthan1");
    $(".apod-placeholder").remove();
  }
});

//GO HOME FROM FAVOURITES TAB
$(".container").on("click", ".apod-logo-fav", function (e) {
  e.preventDefault();
  let fetchTodayURL =
    "https://api.nasa.gov/planetary/apod?api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD";
  resetTemplate();
  fetchCall(fetchTodayURL);
});

//SUBMIT SELECTED DATE
$(".apod-date-form").on("submit", function (e) {
  e.preventDefault();
  $(".apod-bg").css("display", "none");
  resetTemplate();
  scrapeDatesSubmit()
    .then((result) => {
      return `https://api.nasa.gov/planetary/apod?date=${result}&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD`;
    })
    .then((url) => fetchCall(url));
});

///////////////////* GENERIC FETCH *///////////////////

//GENERIC FETCH CALL FOR USE/TEMPLATE - gets passed URL dependent on links clicked and also default renders zoom and heart icons for each image
function fetchCall(url) {
  $(".container").append(
    "<img src='785.gif' alt='loading' class='apod-spinner'>"
  );
  //mobile responsive
  //compare photos with photos within the publicFavourites array, if its been liked you can't add it again (already been liked)
  //add remove functionality to favourites
  //add zoom to favourited pics
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      //  console.log(data);
      let {
        date,
        explanation,
        title,
        url,
        media_type,
        copyright,
        service_version,
        ...rest
      } = data;
     
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
        apodMediaType: media_type,
        apodCopyright: copyright,
        apodVersion: service_version,
      };
      
      if (media_type === "video") {
        console.log("youtube link");
        delete context.apodURL;
        context.apodVid = url;
      }

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
