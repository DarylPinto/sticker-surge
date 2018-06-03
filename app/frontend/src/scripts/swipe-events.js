module.exports = {
	init: function(){

		if(typeof window.CustomEvent != "function") return; //Prevent IE from failing to load page

		let swipeleft = new Event('swipeleft');
		let swiperight = new Event('swiperight');

		let touchPositions = [];
		let horizontalThreshhold = 60;
		let verticalThreshhold = 70;

		document.addEventListener('touchmove', function(e){
			touchPositions.push({
				x: e.touches[0].clientX,
				y: e.touches[0].clientY,
			});
		});

		//Check to dispatch swipe events
		document.addEventListener('touchend', function(e){

			if(touchPositions.length === 0) return;

			let x1 = touchPositions[0].x;
			let x2 = touchPositions[touchPositions.length - 1].x;
			let y1 = touchPositions[0].y;
			let y2 = touchPositions[touchPositions.length - 1].y;
			
			touchPositions = [];

			//Prevent if vertical swipe distance is greater than verticalThreshhold
			if(y1 - y2 > verticalThreshhold || y2 - y1 > verticalThreshhold) return;

			//Dispatch if horizontal swipe is greater than horizontalThreshhold
			if(x1 - x2 > horizontalThreshhold) document.dispatchEvent(swipeleft);
			if(x2 - x1 > horizontalThreshhold) document.dispatchEvent(swiperight);
		});

	}
}