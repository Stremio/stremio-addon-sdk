module.exports = {
   stylize: function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1) + (string !=='series' ? 's,' : ',');
   },
   toggle: function (string) {
      if (string) return "enabled"
      else return "disabled"
   }
}