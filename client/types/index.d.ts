export type SidebarLink = {
  imgURL: string
  route: string
  label: string
}

export type URLProps = {
  params: { id: string }
  searchParams: { [key: string]: string | undefined }
}
