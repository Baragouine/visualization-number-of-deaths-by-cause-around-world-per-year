var SCATTERPLOT_SYM_SCALE = new Object();

//  draw scatterplot
function draw_scatterplot(years, countries, cause_x, cause_y, is_proportion, is_log_x, is_log_y) {
  const margin = ({top: 100, right: 50, bottom: 50, left: 100});

  const w = $("#scatterplot").width();
  const h = w;
  const svg = d3.select("#scatterplot").attr("height", h);

  const data = filter_data_for_years_for_countries(is_proportion ? get_data_prop() : get_data_raw(), years, countries);

  const eps_x = is_log_x ? 1.0 / 10e8 : 0;
  const eps_y = is_log_y ? 1.0 / 10e8 : 0;

  const min_deaths_x = eps_x + get_min_deaths(data, [cause_x]);
  var max_deaths_x = eps_x + get_max_deaths(data, [cause_x]);
  const min_deaths_y = eps_y + get_min_deaths(data, [cause_y]);
  var max_deaths_y = eps_y + get_max_deaths(data, [cause_y]);

  if (min_deaths_x == max_deaths_x)
    max_deaths_x += is_proportion ? 1.0 / 10e8 : 1;

  if (min_deaths_y == max_deaths_y)
    max_deaths_y += is_proportion ? 1.0 / 10e8 : 1;

  const x  = (is_log_x ? d3.scaleLog() : d3.scaleLinear()).domain([min_deaths_x, max_deaths_x]).range([margin.left, w - margin.right]);
  const y  = (is_log_y ? d3.scaleLog() : d3.scaleLinear()).domain([min_deaths_y, max_deaths_y]).range([h-margin.bottom, margin.top]);

  //  clear svg
  svg.selectAll('*').remove();

  const xAxis = g => g
    .attr("transform", `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

  const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.append("g")
     .style("font-size", "12px")
     .call(xAxis);

  svg.append("g")
      .style("font-size", "12px")
      .call(yAxis);

  data.forEach((line) => {
    svg.append("path")
       .attr("d", d3.symbol().type(SCATTERPLOT_SYM_SCALE[line.Year.getFullYear()][0]))
       .attr("transform", "translate(" + x(eps_x + get_sum_deaths_line(line, [cause_x])) + "," + y(eps_y + get_sum_deaths_line(line, [cause_y])) + ")")
       .attr("fill", SCATTERPLOT_SYM_SCALE[line.Year.getFullYear()][1]);
  });
}

//  get list of selected year
function get_list_of_selected_year_scatterplot() {
  const list_all_year = get_list_year();
  var list_year = [];

  list_all_year.forEach(year => {
    if (document.getElementById("scatterplot_list_year-" + year).checked)
      list_year.push(year);
  });

  return list_year;
}

//  get list of selected year
function get_list_of_selected_countries_scatterplot() {
  const list_all_code = get_list_code();
  var list_code = [];

  list_all_code.forEach(code => {
    if (document.getElementById("scatterplot_list_country-" + code).checked)
      list_code.push(code);
  });

  return list_code;
}

//  update scatterplot
function update_scatterplot() {
  draw_scatterplot(get_list_of_selected_year_scatterplot(),
                  get_list_of_selected_countries_scatterplot(),
                  $("#scatterplot_list_cause_x").val(),
                  $("#scatterplot_list_cause_y").val(),
                  document.getElementById("scatterplot_proportion").checked,
                  document.getElementById("scatterplot_log_x").checked,
                  document.getElementById("scatterplot_log_y").checked);
}

//  init list year
function init_scatterplot_list_year() {
  const list_all_years = get_list_year();
  list_all_years.sort();
  var l = document.getElementById("scatterplot_list_year");

  l.innerHTML = '';
  
  for (let i = 0; i < list_all_years.length; ++i) {
    l.innerHTML +=
      '<p style="margin:0; display="flex">'+
        '<label for="scatterplot_list_year-' + list_all_years[i] + '">'+
          '<input class="checkbox" type="checkbox" id="scatterplot_list_year-' + list_all_years[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
           list_all_years[i] + 
        '</label>' +
      '</p>'+
      '<hr class="hrList">';
  }

  list_all_years.forEach(cause => {
    document.getElementById("scatterplot_list_year-" + cause).addEventListener("change",  (ev) => {
      //  garder aux moins une cause coché
      if (get_list_of_selected_cause_geomap().length == 0)
        document.getElementById("scatterplot_list_year-" + cause).checked = true;
        update_scatterplot();
    })
  });
}

//  init list country
function init_scatterplot_list_country() {
  const list_all_code = get_list_code();
  list_all_code.sort((a, b) => {
    const name_a = get_data_grouped_by_code()[a][0]["Country/Territory"];
    const name_b = get_data_grouped_by_code()[b][0]["Country/Territory"];

    if (name_a < name_b)
      return -1;
    else if (name_a > name_b)
      return 1;
    return 0;
  });
  var l = document.getElementById("scatterplot_list_country");

  l.innerHTML = '';
  
  for (let i = 0; i < list_all_code.length; ++i) {
    l.innerHTML +=
      '<p class="pList">'+
        '<label for="scatterplot_list_country-' + list_all_code[i] + '">' +
          '<input class="checkbox" type="checkbox" id="scatterplot_list_country-' + list_all_code[i] + '" ' + (i == 0 ? 'checked' : '') + '>' +
          get_data_grouped_by_code()[list_all_code[i]][0]["Country/Territory"]; +
        '</label>' +
      '</p>'+
      '<hr class="hrList">';
  }

  list_all_code.forEach(cause => {
    document.getElementById("scatterplot_list_country-" + cause).addEventListener("change",  (ev) => {
      //  garder aux moins une cause coché
      if (get_list_of_selected_cause_geomap().length == 0)
        document.getElementById("scatterplot_list_country-" + cause).checked = true;
        update_scatterplot();
    })
  });
}

//  init scatterplot list cause x
function init_scatterplot_list_cause_x() {
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("scatterplot_list_cause_x");

  l.innerHTML = '';

  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML += '<option value="' + list_all_cause[i] + '">' + list_all_cause[i] + '</option>';
  }
}

//  init scatterplot list cause x
function init_scatterplot_list_cause_y() {
  const list_all_cause = get_all_causes();
  list_all_cause.sort();
  var l = document.getElementById("scatterplot_list_cause_y");

  l.innerHTML = '';

  for (let i = 0; i < list_all_cause.length; ++i) {
    l.innerHTML += '<option value="' + list_all_cause[i] + '">' + list_all_cause[i] + '</option>';
  }

}

//  init input
function init_scatterplot_input() {
  init_scatterplot_list_cause_x();
  init_scatterplot_list_cause_y();
  init_scatterplot_list_year();
  init_scatterplot_list_country();

  //  % proportion
  var checkbox = document.getElementById("scatterplot_proportion");
  checkbox.addEventListener("change", (ev) => {
    update_scatterplot();
  });

  //  log x event handler
  checkbox = document.getElementById("scatterplot_log_x");

  checkbox.addEventListener("change", (ev) => {
    update_scatterplot();
  });

  //  log y event handler
  checkbox = document.getElementById("scatterplot_log_y");

  checkbox.addEventListener("change", (ev) => {
    update_scatterplot();
  });
}

//  scatterplot
function scatterplot_main() {
  init_scatterplot_input();

  //  init SCATTERPLOT_SYM_SCALE
  const list_year = get_list_year();
  const list_sym = [d3.symbolCircle, d3.symbolCross, d3.symbolDiamond, d3.symbolSquare, d3.symbolStar, d3.symbolTriangle, d3.symbolWye];
  const list_color = ["#D00", "#0D0", "#00D", "#DD0", "#0DD"];

  var sym = 0;
  var color = 0;

  list_year.forEach((year) => {
    SCATTERPLOT_SYM_SCALE[year] = [list_sym[sym], list_color[color]];
    ++sym;
    if (sym >= list_sym.length)
    {
      sym = 0;
      ++color;
    }
  });

  update_scatterplot();
}

//  on list x change
function onScatterPlotListCauseXChange() {
  update_scatterplot();
}

//  on list y change
function onScatterPlotListCauseYChange() {
  update_scatterplot();
}

