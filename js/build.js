// we have groups of elements
// each group is defined by a
// data-multi attribute group
const grps = $('[data-multi!=""][data-multi]');
let groups = [];

// separate groups with style
const bottom_border = {'border-bottom': '2px solid #000'};

// each group will have a new
// row with a cat "add group"
// that duplicates each group
grps.map((i, el) => {
  const grp = $(el).attr('data-multi');
  const nic = $(el).attr('data-multi-nice');
  if (! groups.includes(grp)) {
    groups.push(grp);
    const last = $(`[data-multi=${grp}]:last`);
    last.css(bottom_border);
    const addr_html = `
      <tr>
        <td></td>
        <td>
          <a class="addline" href="javascript:" onclick="addLine(event, this, '${grp}');">
            +Add ${nic}
          </a>
        </td>
      </tr>
    `;
    const addr = $(addr_html);
    addr.insertAfter(last);
  }
});

// when the add group buttons
// are clicked, this function
// does html duplication work
function addLine(event, _el, grp) {
  event.preventDefault();
  const shift_click = (event.shiftKey) ? true : false;
  const el = $(_el);
  let tr = el.parents('tr'), els = [];
  const add_tr = tr;
  do {
    tr = tr.prev();
    if (! tr.is(`[data-multi=${grp}]`)) {
      // no more in this multi group
      // stop searching for them now
      tr = false;
    } else {
      if (tr.hasClass('clone')) {
        // we want to keep searching
        // but don't want the clones
      } else {
        els.push(tr);
      }
    }
  } while (!!tr);

  // okay add html to the dom
  // nothing that the input's
  // names use array[] syntax
  els.reverse().map((el, i) => {
    let clone = el.clone();
    if (!shift_click) {
      clone.find('input').val('');
    }
    clone.addClass('clone');
    clone.insertBefore(add_tr);
  });
}

const help_text_div = $('#help-text').clone();
$('#help-text').remove();
function show_question(_el, help_text) {
  $('#help-text').remove();
  const parent_tr = $(_el).parents('tr');
  const temp_tr = help_text_div.clone();
  temp_tr.find('.help-text').html(help_text +' <span class="x">[click to close]</a>');
  temp_tr.insertAfter(parent_tr);
  setTimeout("$('#help-text').addClass('on')", 100);
  temp_tr.on('click', ()=>{
    $('#help-text').removeClass('on');
    setTimeout("$('#help-text').remove()", 500);
   });
}
