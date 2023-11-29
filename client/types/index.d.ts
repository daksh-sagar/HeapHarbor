export type SidebarLink = {
  imgURL: string
  route: string
  label: string
}

export type SearchParams = { q?: string; sort?: string; page?: string }
export type URLProps = {
  params: { id: string }
  searchParams: SearchParams
}
