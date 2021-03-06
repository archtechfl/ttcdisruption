
if (Meteor.isClient) {
// After disruption template render
// Handles the insert of the day dividers in the listing

    Template.ttcdisruption.rendered = function(){
        var daysAgoCheck = this.$('.disruption-entry .time-overall').data("days-ago");
        // current node
        var currentNode = this.$('.disruption-entry')[0];
        // Enabled tooltip
        $(currentNode).find('[data-toggle="tooltip"]').tooltip();
        // Get information on entry before this one
        var previousEntry = this.$('.disruption-entry').prev();
        previousEntry = previousEntry[0];
        var afterHeader = false;
        // Update time to current time if the entry is the newest one,
        // to indicate how old the records are
        if ($(previousEntry).hasClass("disruption-table-header")){
            Session.set("currentTime", moment().toISOString());
            afterHeader = true;
        }
        var previousDays = 0;
        var boundaryCheck = false;
        if (!afterHeader){
            // Get month and day of entry above the current one if it corresponds to new day
            previousDays = $(previousEntry).find('.time-overall').data("days-ago");
            boundaryCheck = (previousDays !== daysAgoCheck);
        }
        if (boundaryCheck){
            var thisMonth = $(previousEntry).find('.time-overall').data("month");
            var thisDay = $(previousEntry).find('.time-overall').data("day");
            var dividerLabel = thisMonth + " " + thisDay;
            // Add a helper class to end of day
            $(currentNode).addClass("end-of-day-entry");
            // Render the day divider
            Blaze.renderWithData(Template.day_divider, {date: dividerLabel }, $('.disruption-list-body')[0], currentNode);
        }
    };

    Template.ttcdisruption.destroyed = function() {
      // Check for day dividers to remove
      var dayDividerElement = this.$('.disruption-entry').prev();
      var currentNode = this.$('.disruption-entry')[0];
      // Check if end of day entry
      var endOfDay = $(currentNode).hasClass("end-of-day-entry");
      dayDividerElement = $(dayDividerElement)[0];
      var isDayDivider = $(dayDividerElement).hasClass("day-divider");
      if (isDayDivider && endOfDay){
        // Remove the day divider if the day after it is removed, since there is no longer a need
        // to mark a new day there
        var view = Blaze.getView(dayDividerElement);
        Blaze.remove(view);
      }
    };

}