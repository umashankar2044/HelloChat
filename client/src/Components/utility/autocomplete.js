const autocomplete = (inp, value, arr, componentref) => {
  var a,
    b,
    i,
    val = value;
  /*close any already open lists of autocompleted values*/
  closeAllLists(null, inp);
  if (!val) {
    return false;
  }
  /*create a DIV element that will contain the items (values):*/
  a = document.createElement("DIV");
  a.setAttribute("id", inp.id + "autocomplete-list");
  a.setAttribute("class", "autocomplete-items");
  /*append the DIV element as a child of the autocomplete container:*/
  inp.parentNode.appendChild(a);
  /*for each item in the array...*/
  for (i = 0; i < arr.length; i++) {
    /*create a DIV element for each matching element:*/
    b = document.createElement("DIV");
    /*make the matching letters bold:*/
    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
    b.innerHTML += arr[i].substr(val.length);
    /*insert a input field that will hold the current array item's value:*/
    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
    /*execute a function when someone clicks on the item value (DIV element):*/
    b.addEventListener("click", function (e) {
      /*insert the value for the autocomplete text field:*/
      inp.value = this.getElementsByTagName("input")[0].value;
      componentref.setState({ newUser: inp.value });
      /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
      closeAllLists();
    });
    a.appendChild(b);
  }
};

const closeAllLists = (elmnt, inp) => {
  /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
  var x = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < x.length; i++) {
    if (elmnt !== x[i] && elmnt !== inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
};

module.exports = { closeAllLists, autocomplete };
