import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Nav, Navbar as NavbarComponent } from 'react-bootstrap'
import { resolveLanguage } from '../../utils'
import translations from './translations'

const Navbar: React.FC = () => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)

  const translation = translations[locale]

  return (
    <NavbarComponent collapseOnSelect expand='md' bg='dark' variant='dark' fixed='top'>
      <NavbarComponent.Brand href='/'>NIZKCTF</NavbarComponent.Brand>
      <NavbarComponent.Toggle aria-controls='responsive-navbar-nav' />
      <NavbarComponent.Collapse id='responsive-navbar-nav'>
        <Nav className='ml-auto'>
          <Link href='/challenges' passHref locale={locale} prefetch={false}>
            <Nav.Link>{translation.challenges}</Nav.Link>
          </Link>
          <Link href='/ranking' passHref locale={locale} prefetch={false}>
            <Nav.Link>{translation.ranking}</Nav.Link>
          </Link>
          <Link href='/rules' passHref locale={locale} prefetch={false}>
            <Nav.Link>{translation.rules}</Nav.Link>
          </Link>
          <Link href='/faq' passHref locale={locale} prefetch={false}>
            <Nav.Link>{translation.faq}</Nav.Link>
          </Link>
        </Nav>
      </NavbarComponent.Collapse>
    </NavbarComponent>
  )
}

export default Navbar