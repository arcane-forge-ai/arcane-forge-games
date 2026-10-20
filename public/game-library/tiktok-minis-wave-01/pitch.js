'use strict';
document.querySelectorAll('[data-choice-widget]').forEach(widget=>{
  const buttons=[...widget.querySelectorAll('button[data-select]')];
  function select(value){
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.select===value)));
    widget.querySelectorAll('[data-choice]').forEach(panel=>{panel.hidden=panel.dataset.choice!==value;});
    widget.dataset.selected=value;
  }
  buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.select)));
  select('a');
});
