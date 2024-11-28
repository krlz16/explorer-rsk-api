export interface IPaginationOptions {
  page_data: number;
  take_data: number;
  count: number;
}

export interface IPaginationResult {
  skip: number;
  take: number;
  totalPages: number;
  currentPage: number;
}
