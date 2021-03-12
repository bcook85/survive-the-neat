

let playerContainer = document.getElementById("PlayerContainer");


function buildPlayerTables() {
	for (let i = 0; i < 4; i++) {
		let flexColumn = document.createElement("div");
		flexColumn.className = "flexColumn";

		let h2 = document.createElement("h2");
		h2.setAttribute("innerHTML", `Player ${i + 1}`);

		let optionTable = document.createElement("table");
		optionTable.className = "optionsTable";

		
	}
}


/*
<div class="flexColumn">
	<h2>Player 1</h2>
	<table class="optionsTable">
		<tr>
			<th>Name</th>
			<td><input type="text" id="Player1Name" value="Alice"></td>
		</tr>
		<tr>
			<th>Color</th>
			<td><input type="text" id="Player1Color" value="rgb(0,127,200)"></td>
		</tr>
		<tr>
			<th>Max Health</th>
			<td><input type="number" id="Player1Health" value="5"></td>
		</tr>
		<tr>
			<td colspan="2">Vision</td>
		</tr>
		<tr>
			<th>Rays To Cast</th>
			<td><input type="number" id="Player1Rays" value="7"></td>
		</tr>
		<tr>
			<th>FOV</th>
			<td>
				<select id="Player1FOVSelect">
					<option value="180">180&deg;</option>
					<option value="360">360&deg;</option>
				</select>
			</td>
		</tr>
		<tr>
			<th>View Distance</th>
			<td><input type="number" id="Player1ViewDistance" value="8"></td>
		</tr>
		<tr>
			<td colspan="2">Neural Network</td>
		</tr>
		<tr>
			<th>Neural Network Input Count</th>
			<td><input type="number" id="Player1InputLayers" value="24" disabled="disabled"></td>
		</tr>
		<tr>
			<th>Hidden Layers</th>
			<td><input type="text" id="Player1HiddenLayers" value="18,12"></td>
		</tr>
		<tr>
			<th>Neural Network Output Count</th>
			<td><input type="number" id="Player1OutputLayers" value="8" disabled="disabled"></td>
		</tr>
		<tr>
			<th>Mutation Chance</th>
			<td><input type="number" id="Player1MutationChance" value="0.01"></td>
		</tr>
		<tr>
			<th>Mutation Amount</th>
			<td><input type="number" id="Player1MutationAmount" value="0.01"></td>
		</tr>
		<tr>
			<td colspan="2">Score Point Values</td>
		</tr>
		<tr>
			<th>Attack Enemy</th>
			<td><input type="number" id="Player1AttackEnemy" value="1"></td>
		</tr>
		<tr>
			<th>Attack Ally</th>
			<td><input type="number" id="Player1AttackAlly" value="-1"></td>
		</tr>
		<tr>
			<th>Attack</th>
			<td><input type="number" id="Player1Attack" value="-0.001"></td>
		</tr>
		<tr>
			<th>Alive</th>
			<td><input type="number" id="Player1Alive" value="-0.001"></td>
		</tr>
		<tr>
			<th>Explore</th>
			<td><input type="number" id="Player1Explore" value="0.01"></td>
		</tr>
	</table>
</div>
*/