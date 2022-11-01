//global
var publicFavourites = [];
var yearArray = [];

//to check and re-set localStorage into publicFavourites if present
function checkLocalStorage() {
  if (localStorage.getItem("favourited") !== null) {
    publicFavourites = JSON.parse(localStorage.getItem("favourited"));
  }
}
// run localstorage check
checkLocalStorage();

//dates
const dateRef = new Date();
const dateDay = dateRef.getDate();
const dateMonth = dateRef.getMonth() + 1;
const newestYear = yearArray.length - 1;

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

//init//
//page load - first visit
fetchCall(
  "https://api.nasa.gov/planetary/apod?date=2020-06-12&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD"
);

// reset template - used for rerender //
function resetTemplate() {
  $("#nasa-template-whole").remove();
}

//generate years array for date picker
function generateYears() {
  let max = new Date().getFullYear();
  let min = max - 7;
  for (let i = max; i >= min; i--) {
    yearArray.push(i);
  }
  return yearArray;
}

//show months array in datepicker ui
function loopMonths() {
  monthsOf.forEach((month, index) => {
    $(".apod-month").append(
      `<option value='${index + 1}' class='apod-year'>${month}</option>`
    );
  });
}

//show days array in datepicker ui on pageload
function loopDays() {
  const daysJanOnLoad = new Date("2022", "1", 0).getDate();
  for (let i = 1; i < daysJanOnLoad; i++) {
    $(".apod-day-select").append(
      `<option value='${i}' class='apod-day'>${i}</option>`
    );
  }
}

//show years array in datepicker ui
function loopYears() {
  yearArray.forEach((year, j) => {
    $(".apod-year-select").append(
      `<option value='${year}' class='apod-year'>${year}</option>`
    );
  });
}

// Run datepicker setup
generateYears();
loopMonths();
loopYears();
loopDays();

//handlebars helper -> to display the date of photo taken in prettier formatting under photo and title
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

// text regex transform -> First paragraph separated
function transformString(stringy) {
  let regex = /^.*?[\.!\?](?:\s|$)/;
  let firstSentence = stringy.match(regex);
  let remainingSentences = stringy.replace(regex, "");
  let sentenceSplits = [firstSentence, remainingSentences];
  return sentenceSplits;
}

//date randomizer
async function randomizeDate() {
  let randomMonth = Math.floor(Math.random() * 11) + 1;
  let randomYearSelector = Math.floor(Math.random() * yearArray.length);
  let randomYear = yearArray[randomYearSelector];
  let daysInMonth = new Date(randomYear, randomMonth, 0).getDate();
  let randomDay = Math.floor(Math.random() * daysInMonth) + 1;
  let newRandomDate = new Date(randomYear, randomMonth, randomDay);
  //if future date is randomized, run again
  if (newRandomDate > dateRef) {
    return randomizeDate();
  } else {
    let randomDate = `${randomYear}-${randomMonth}-${randomDay}`;
    return randomDate;
  }
}

//scrape user input dates from datepicker ui
async function scrapeDatesSubmit() {
  let dayInput = $(".apod-day-select").val();
  let monthInput = $(".apod-month").val();
  let yearInput = $(".apod-year-select").val();
  let chosenDate = `${yearInput}-${monthInput}-${dayInput}`;
  return chosenDate;
}

//render favourited pictures -> think of fetch, but internal
function favouriteCall(favObject) {
  let source = $("#nasa-app-fav-template").html();
  let template = Handlebars.compile(source);
  let html = template(favObject);
  $(".container").append(html);
  zoomImage(".icon__search__fav");
  removeFavImage();
}

//zooms image in
function zoomImage(selector) {
  $(selector).on("click", function (e) {
    e.preventDefault();
    let loadedImg = $(this).siblings(".apod-img").attr("src");
    $(".modal, .apod-img-expanded").css("display", "flex");
    $(".apod-img-expanded").html(
      `<img src=${loadedImg} class='apod-expanded-src'>`
    );
    $(".apod-expanded-src").css("display", "flex");
  });
}

//removes fav image from dom
function removeFavImage() {
  $(".apod-remove-fav").on("click", function (e) {
    e.preventDefault();
    let favURL = $(this).siblings(".apod-img");
    loopAndUpdate(publicFavourites, favURL);
    $(this).parent().remove();
    if (publicFavourites.length == 0) {
      $(".apod-placeholder").show();
    }
  });
}

//loops publicFavourite array of objects, if the current 'liked' photo already exists in the publicFavourite, remove it and add this newer like.
function loopAndUpdate(arrayOfObj, selly) {
  let testFavUrlExists = $(selly).attr("src");
  let localStorageFavourited = JSON.parse(localStorage.getItem("favourited"));
  arrayOfObj.forEach((apod, i) => {
    if (apod.url === testFavUrlExists) {
      arrayOfObj.splice(i, 1);
      localStorageFavourited.splice(i, 1);
    }
    localStorage.setItem("favourited", JSON.stringify(localStorageFavourited));
  });
}

//check if already in the publicFavourites array of objects, if so, keep heart set to red as already liked for user.
function checkIfLiked(passObje) {
  let testFavUrlExists = $(".apod-img").attr("src");
  passObje.forEach((apod, i) => {
    if (apod.url === testFavUrlExists) {
      $(".icon__heart").css("color", "rgb(247, 139, 166)");
    }
  });
}

//disable button in datepicker ui if invalid date selected (day/month/year will be reset to null for user to re-select)
function disableButton() {
  if ($(".apod-month").val() === null || $(".apod-day-select").val() === null) {
    $("button.apod-submit-date").attr("disabled", true);
  } else {
    $("button.apod-submit-date").attr("disabled", false);
  }
}

//watches changes by the user on the dates inputted to dynamically generate the correct days ie february per year, or that newest year is only up to a certain month.
function watchDates() {
  //For days to be updated by year picked - will store last chosen date for next month/year picked unless doesnt exist ie 31st in February
  $(".apod-month, .apod-year-select").on("change", function (e) {
    let dayInput = $(".apod-day-select").val(); //grab inputted day onChange
    $(".apod-day-select").children().remove(); //remove days to re-render days
    e.preventDefault();

    let i = 1; //counter ref
    let monthInput = $(".apod-month").val(); // grab inputted month
    let yearInput = $(".apod-year-select").val(); // grab inputted year
    let days = new Date(yearInput, monthInput, 0).getDate(); // calculate days in this month and year, ie feb 2015 28, feb 2016 29.

    //if this year
    if (yearArray[0] == yearInput) {
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

    if (yearArray[0] == yearInput && monthInput == dateMonth) {
      // if year is newest and userchosen year is newest, AND theyve picked the current month, then only use the counter up to the present day, i.e August 2020 = TRUE, TODAY date is 16 august, only render days up to 16th else, continue appending from code above to calculate days of month in chosen month/year.
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

//click functions//
//click pick date
$(".container").on("click", ".apod-link-2", function (e) {
  e.preventDefault();
  $(".apod-bg").css("display", "flex");
  watchDates();
});

// click pick date - render year/month/day on pageload
$(".container").on("click", ".apod-link-2", function (e) {
  let previousMonthSelected = $(".apod-month").val();
  e.preventDefault();
  if (
    $(".apod-year-select").val() == yearArray[0] &&
    previousMonthSelected < dateMonth
  ) {
    $(".apod-month").children().remove();

    let currentMonths = 0;
    while (monthsOf[currentMonths] !== monthsOf[dateMonth]) {
      currentMonths++;
      $(".apod-month").append(
        `<option value='${currentMonths}' class='apod-year'>${
          monthsOf[currentMonths - 1]
        }</option>`
      );
    }
  }
});

//disable / enable functionality for datepicker ui
$(".apod-month, .apod-year-select, .apod-day-select").on(
  "change",
  async function (e) {
    e.preventDefault();
    await watchDates();
    await disableButton();
  }
);

//todays apod link
$(".container").on("click", ".apod-link-1", function (e) {
  e.preventDefault();
  let fetchTodayURL =
    "https://api.nasa.gov/planetary/apod?api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD";
  resetTemplate();
  fetchCall(fetchTodayURL);
});

//randomize date link
$(".container").on("click", ".apod-link-3", function (e) {
  e.preventDefault();
  resetTemplate();
  randomizeDate()
    .then((result) => {
      return `https://api.nasa.gov/planetary/apod?date=${result}&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD`;
    })
    .then((url) => fetchCall(url));
});

//click off date picker
function removeDatePicker() {
  $(".apod-x").on("click", function (e) {
    e.preventDefault();
    $(".apod-bg").css("display", "none");
  });
}
removeDatePicker();

//favourites tab click
$(".container").on("click", ".apod-link-4", function (e) {
  e.preventDefault();
  resetTemplate();
  favouriteCall(publicFavourites);
  if (publicFavourites.length != 0) {
    $(".apod-placeholder").hide();
  }
});

//go home, re-fetch original photo set by yours truly
$(".container").on("click", ".apod-logo-fav", function (e) {
  e.preventDefault();
  let fetchTodayURL =
    "https://api.nasa.gov/planetary/apod?date=2020-06-12&api_key=G3IWAB5yFZXWzW56OA9GbVfqcGCgJqq1Z6f424eD";
  resetTemplate();
  fetchCall(fetchTodayURL);
});

//submit selected date
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
  let errorMsg =
    "<div class='errorMsg'>  <div class='errorSry'>Sorry!</div> Looks like that request didn't work. <button class='nasa_search_again'> Search again </button> </div>";
  fetch(url)
    .then((response) => {
      if (response.status === 400 || response.status === 404) {
        $(".apod-spinner").remove();
        $(".container").append(errorMsg);
        $(".container").on("click", ".nasa_search_again", function (e) {
          e.preventDefault();
          location.href = "/index.html";
          $(".errorMsg").remove();
        });
        throw new Error("400 error");
      }
      return response.json();
    })
    .then((data) => {
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
        delete context.apodURL;
        context.apodVid = url;
      }

      $(".apod-spinner").remove();
      let html = template(context);
      $(".container").append(html);
      additionalFeatures(data);
    });
}

function additionalFeatures(fetchData) {
  //expand image
  zoomImage(".icon__search");
  checkIfLiked(publicFavourites);
  //close expand
  $(".modal, .apod-img-expanded, .apod-expanded-src").on("click", function (e) {
    e.preventDefault();
    $(".modal, .apod-img-expanded, .apod-expanded-src").hide();
  });

  //favourite heart icon
  $(".icon__heart").on("click", function (e) {
    e.preventDefault();
    //splice, then add again below
    if ($(".icon__heart").css("color") === "rgb(247, 139, 166)") {
      $(".icon__heart").css("color", "#808080");
      loopAndUpdate(publicFavourites, ".apod-img");
    } else {
      $(".icon__heart").css("color", "#f78ba6");
      publicFavourites.unshift(fetchData); //to beginning of array
      publicFavourites[0].favouritedPic = true;
    }
    localStorage.setItem("favourited", JSON.stringify(publicFavourites));
  });
}
