let parkingSlots = [];
let carTimers = {};
let reservedSlots = {};
const fareRates = {
    Hatchback: 10,
    Sedan: 12,
    SUV: 15,
    Truck: 18,
    Minivan: 14,
};

document.getElementById("createSlotsBtn").addEventListener("click", createParkingSlots);
document.getElementById("parkCarBtn").addEventListener("click", parkCar);
document.getElementById("leaveCarBtn").addEventListener("click", leaveParking);
document.getElementById("reserveSlotBtn").addEventListener("click", reserveParkingSlot);

function createParkingSlots() {
    const carType = document.getElementById("carType").value;
    const numSlots = parseInt(document.getElementById("slots").value);

    for (let i = 0; i < numSlots; i++) {
        parkingSlots.push({ carType, carName: null, reservedUntil: null });
    }

    displayParkingStatus();
    updateSlotAvailability();
}

function parkCar() {
    const carName = document.getElementById("carName").value;
    const carType = document.getElementById("parkCarType").value;

    for (let i = 0; i < parkingSlots.length; i++) {
        if (parkingSlots[i].carType === carType && parkingSlots[i].carName === null && !isSlotReserved(i)) {
            parkingSlots[i].carName = carName;
            carTimers[carName] = new Date(); 
            displayParkingStatus();
            updateSlotAvailability();
            alert(`${carName} has been parked in a ${carType} slot.`);
            return;
        }
    }

    alert(`No available slots for ${carType}`);
}

function leaveParking() {
    const carName = document.getElementById("leaveCarName").value;

    for (let i = 0; i < parkingSlots.length; i++) {
        if (parkingSlots[i].carName === carName) {
            const parkedTime = calculateFare(carName, parkingSlots[i].carType);
            alert(`${carName} has been parked for ${parkedTime.hours} hours and ${parkedTime.minutes} minutes. Total Fare: $${parkedTime.fare}.`);
            parkingSlots[i].carName = null; 
            delete carTimers[carName]; 
            displayParkingStatus();
            updateSlotAvailability();
            return;
        }
    }

    alert(`No car found with the name ${carName}`);
}

function reserveParkingSlot() {
    const carName = document.getElementById("reserveCarName").value;
    const carType = document.getElementById("reserveCarType").value; 
    const reserveTime = parseInt(document.getElementById("reserveTime").value) * 60 * 1000; 

    for (let i = 0; i < parkingSlots.length; i++) {
        if (parkingSlots[i].carType === carType && parkingSlots[i].carName === null && !isSlotReserved(i)) {
            parkingSlots[i].reservedUntil = new Date(Date.now() + reserveTime); 
            reservedSlots[carName] = i; 
            displayParkingStatus();
            updateSlotAvailability();
            alert(`Slot reserved for ${carName} (${carType}) for ${reserveTime / 60000} minutes.`);

            setTimeout(() => {
                if (parkingSlots[i].reservedUntil && Date.now() >= parkingSlots[i].reservedUntil.getTime()) {
                    parkingSlots[i].reservedUntil = null; 
                    delete reservedSlots[carName];
                    displayParkingStatus();
                    updateSlotAvailability();
                }
            }, reserveTime);
            return;
        }
    }

    alert(`No available ${carType} slots to reserve!`);
}

function calculateFare(carName, carType) {
    const parkedTime = Math.floor((new Date() - carTimers[carName]) / 60000); 
    const fare = Math.ceil(parkedTime / 60) * fareRates[carType]; 
    return {
        hours: Math.floor(parkedTime / 60),
        minutes: parkedTime % 60,
        fare: fare,
    };
}

function displayParkingStatus() {
    const slotsContainer = document.getElementById("slotsContainer");
    slotsContainer.innerHTML = ""; 

    parkingSlots.forEach((slot, index) => {
        const slotDiv = document.createElement("div");
        slotDiv.className = slot.carType; // Add vehicle type class

        if (slot.carName) {
            slotDiv.classList.add("occupied");
            slotDiv.innerHTML = slot.carName;
        } else if (slot.reservedUntil) {
            slotDiv.classList.add("reserved");
            slotDiv.innerHTML = `Reserved until ${slot.reservedUntil.toLocaleTimeString()}`;
        } else {
            slotDiv.classList.add("available");
            slotDiv.innerHTML = "Available";
        }
        
        slotsContainer.appendChild(slotDiv);
    });
}

function updateSlotAvailability() {
    const slotAvailability = document.getElementById("slotAvailability");
    slotAvailability.innerHTML = ""; 

    parkingSlots.forEach((slot, index) => {
        const status = document.createElement("div");
        status.textContent = `Slot ${index + 1}: ${slot.carName ? slot.carName : (slot.reservedUntil ? `Reserved until ${slot.reservedUntil.toLocaleTimeString()}` : "Available")}`;
        slotAvailability.appendChild(status);
    });
}

function isSlotReserved(index) {
    return parkingSlots[index].reservedUntil && Date.now() < parkingSlots[index].reservedUntil.getTime();
}
