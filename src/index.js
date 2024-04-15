const url = "https://dummyjson.com/users";

class Table {
	#table = document.querySelector(".table__render");
	#spinner = document.querySelector(".table__spinner");
	#template = "";

	constructor() {
		this.render();
	}
	render(dataToRender) {
		if (!dataToRender) {
			this.#spinner.classList.remove("hide");
			return;
		}

		dataToRender.forEach(
			({
				firstName,
				company: { name: companyName },
				phone,
				email,
				address: { city },
				gender,
			}) => {
				this.#template += `
			<tr class="table__row">
			<td class="table__cell table__cell_1">${firstName}</td>
			<td class="table__cell table__cell_2">${companyName}</td>
			<td class="table__cell table__cell_3">${phone}</td>
			<td class="table__cell table__cell_4">${email}</td>
			<td class="table__cell table__cell_5">${city}</td>
			<td class="table__cell ${gender == "male" ? "status" : "status_inactive"}">${gender}</td>
		</tr>`;
			}
		);
		this.#spinner.classList.add("hide");
		this.#table.innerHTML = this.#template;
		this.#template = "";
	}
}

class UsersApi {
	#users = [];
	#filteredUsers = [];
	#select = "firstName,company,phone,email,address,gender";
	#total = 0;
	#skip = 0;
	#limit = 30;
	#sort = "firstName";
	#search = "";

	async fetchUsers() {
		let fetchUrl = `${url}?skip=${this.#skip}&select=${this.#select}&limit=${this.#limit}`;

		await fetch(fetchUrl)
			.then((res) => res.json())
			.then((data) => {
				this.#users = [...this.#users, ...data.users];
				this.#total = data.total;
				this.skip = this.#skip + 30;
				this.sortUsers();
			});
	}
	getUsers() {
		if (this.#search) return this.#filteredUsers;
		return this.#users;
	}
	getTotal() {
		return this.#total;
	}
	async loadMore() {
		if (this.#skip < 90) {
			this.#skip = this.#skip + 30;
			await this.fetchUsers();
		}
		if (this.#skip >= 90) {
			this.#limit = 10;
		}
		if (this.#users.length >= this.#total) {
			return;
		}
	}
	resetUsers() {
		this.#skip = 0;
		this.#users = [];
		this.#limit = 30;
	}
	sortUsers() {
		this.#users.sort((a, b) => {
			let aa, bb;
			switch (this.#sort) {
				case "firstName": {
					aa = a.firstName;
					bb = b.firstName;
				}
				case "company": {
					aa = a.company.name;
					bb = b.company.name;
				}
				case "city": {
					aa = a.address.city;
					bb = b.address.city;
				}
			}

			if (aa < bb) return -1;
			if (aa > bb) return 1;
			return 0;
		});
	}
	setSort(sort) {
		this.#sort = sort;
	}
	setSearch(search) {
		this.#search = search;
	}
	filter() {
		const reg = new RegExp(this.#search, "gi");
		this.#filteredUsers = this.#users.filter((item) => {
			return reg.test(item.firstName);
		});
	}
}
const table = new Table();
const api = new UsersApi();

class Pagination {
	#paginationInfo = document.querySelector(".pagination__info");
	#nextItem = document.querySelector(".pagination__next");
	#prevItem = document.querySelector(".pagination__prev");
	#firstLink = document.querySelector(".pagination__first");
	#secondLink = document.querySelector(".pagination__second");
	#thirdLink = document.querySelector(".pagination__third");
	#fourthLink = document.querySelector(".pagination__fourth");
	#lastPageElement = document.querySelector(".pagination__last");

	#currentArray = [];
	#page = 1;
	#lastPage = 0;
	#total = 0;
	#currentTotal = 0;

	constructor() {
		this.#nextItem.addEventListener("click", this.onNextSelect);
		this.#prevItem.addEventListener("click", this.onPrevSelect);
		this.#firstLink.addEventListener("click", this.onSelect);
		this.#secondLink.addEventListener("click", this.onSelect);
		this.#thirdLink.addEventListener("click", this.onSelect);
		this.#fourthLink.addEventListener("click", this.onSelect);
		this.#lastPageElement.addEventListener("click", this.onSelect);
		this.initApp();
	}
	async initApp() {
		table.render();
		await api.fetchUsers();
		this.updateCurrentArray();
		table.render(this.#currentArray);

		this.#total = api.getTotal();
		this.#currentTotal = api.getUsers().length;
		this.#lastPage = Math.ceil(this.#total / 8);
	}

	handlePagination() {
		this.updateCurrentArray();
		table.render(this.#currentArray);
		this.updatePaginationInfo(this.#total);
	}

	async updatePaginationUi() {
		const prevActive = document.querySelector(".pagination__link_active");
		prevActive.classList.remove("pagination__link_active");

		if (this.#page * 8 > this.#currentTotal) {
			await api.loadMore();
			this.#currentTotal = api.getUsers().length;
		}

		if (this.#page === 1) {
			this.#firstLink.classList.add("pagination__link_active");
			this.#firstLink.innerText = this.#page;
			this.#secondLink.innerText = this.#page + 1;
			this.#thirdLink.innerText = this.#page + 2;
			this.#fourthLink.innerText = this.#page + 3;
		}

		if (this.#page > 1 && this.#page < this.#lastPage - 2) {
			this.#secondLink.classList.add("pagination__link_active");
			this.#secondLink.innerText = this.#page;
			this.#firstLink.innerText = this.#page - 1;
			this.#thirdLink.innerText = this.#page + 1;
			this.#fourthLink.innerText = this.#page + 2;
		}
		if (this.#page == this.#lastPage - 2) {
			this.#thirdLink.classList.add("pagination__link_active");
			this.#firstLink.innerText = this.#page - 2;
			this.#secondLink.innerText = this.#page - 1;
			this.#thirdLink.innerText = this.#page;
			this.#fourthLink.innerText = this.#page + 1;
		}
		if (this.#page == this.#lastPage - 1) {
			this.#fourthLink.classList.add("pagination__link_active");
			this.#firstLink.innerText = this.#page - 3;
			this.#secondLink.innerText = this.#page - 2;
			this.#thirdLink.innerText = this.#page - 1;
			this.#fourthLink.innerText = this.#page;
		}
		if (this.#page == this.#lastPage) {
			this.#lastPageElement.classList.add("pagination__link_active");
			this.#firstLink.innerText = this.#page - 4;
			this.#secondLink.innerText = this.#page - 3;
			this.#thirdLink.innerText = this.#page - 2;
			this.#fourthLink.innerText = this.#page - 1;
			api.loadMore();
			await api.fetchUsers();
		}

		this.#lastPageElement.innerText = this.#lastPage;

		this.handlePagination();
	}
	onNextSelect = () => {
		this.#page = this.#page + 1;
		this.updatePaginationUi();
	};
	onPrevSelect = () => {
		if (this.#page === 1) return;
		this.#page = this.#page - 1;
		this.updatePaginationUi();
	};
	onSelect = (e) => {
		this.#page = +e.target.innerText;
		this.updatePaginationUi();
	};
	resetPagination() {
		this.#page = 1;
		this.updatePaginationUi();
	}
	updatePaginationInfo() {
		const from = (this.#page - 1) * 8;
		const to = from + 8;

		const template = `
		Показаны данные с ${from} по ${to} из ${this.#total} записей
		`;
		this.#paginationInfo.innerText = template;
	}
	updateCurrentArray() {
		let start = this.#page * 8 - 8;
		let end = start + 8;
		this.#currentArray = api.getUsers().slice(start, end);
	}
}
const pagination = new Pagination();

const selectElement = document.querySelector(".header__select");
const searchElement = document.querySelector(".header__search");

selectElement.addEventListener("change", sortBy);
searchElement.addEventListener("keyup", filterBy);

async function sortBy(e) {
	const { value } = e.target;
	api.setSort(value);
	api.sortUsers();
	await pagination.resetPagination();
}
async function filterBy(e) {
	const { value } = e.target;
	api.setSearch(value);
	api.filter();
	await pagination.resetPagination();
}
