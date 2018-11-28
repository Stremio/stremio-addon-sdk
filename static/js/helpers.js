module.exports = {
   stylize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1) + (string !=='series' ? 's,' : ',');
   }
}