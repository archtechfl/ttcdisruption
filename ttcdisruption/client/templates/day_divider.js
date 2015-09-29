
if (Meteor.isClient) {
// After disruption template render
// Handles the insert of the day dividers in the listing

    Template.ttcdisruption.rendered = function(){
        var daysAgoCheck = this.$('.disruption-entry .time-overall').data("days-ago");
        // current node
        var currentNode = this.$('.disruption-entry')[0];
        // Get information on entry before this one
        var previousEntry = this.$('.disruption-entry').prev();
        previousEntry = previousEntry[0];
        // Get month and day of entry above the current one if it corresponds to new day
        previousDays = $(previousEntry).find('.time-overall').data("days-ago");
        if (_.isUndefined(previousDays)){
            previousDays = 0;
        }
        var boundaryCheck = (previousDays !== daysAgoCheck);
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
      console.log(this);
      console.log("Template removed");
    };

}