import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Dropdown, Nav, Navbar as NavbarComponent } from 'react-bootstrap'
import ReactCountryFlag from 'react-country-flag'
import { FaDiscord } from 'react-icons/fa'


import { logout, useAuth } from '../../service/auth'
import { resolveCountryFlag, resolveLanguage, supportedCountryFlags } from '../../utils'

import translations from './translations'

const Navbar: React.FC = () => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const countryFlag = resolveCountryFlag(locale)

  const { user } = useAuth()

  const translation = translations[locale]

  return (
    <NavbarComponent collapseOnSelect expand='md' bg='dark' variant='dark' fixed='top'>
      <NavbarComponent.Brand href='/'><img src='/images/holding_flag.svg' height={40} alt='NIZKCTF' /></NavbarComponent.Brand>
      <NavbarComponent.Toggle aria-controls='responsive-navbar-nav' />
      <NavbarComponent.Collapse id='responsive-navbar-nav'>
        <Nav className='mr-auto'>
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
          <Nav.Link href='https://discord.gg/yku9WhKgjj'><FaDiscord title='Discord' /></Nav.Link>
        </Nav>

        <Nav className='ml-auto'>
          <Nav.Item>
            <Dropdown>
              <Dropdown.Toggle variant=''>
                <ReactCountryFlag countryCode={countryFlag} aria-label={countryFlag} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {
                  Object.entries(supportedCountryFlags).map(([language, flag]) =>
                    <Dropdown.Item href={`/${language}`} key={flag}>
                      <ReactCountryFlag countryCode={flag} aria-label={flag} /> <span className='ml-2'>{language}</span>
                    </Dropdown.Item>
                  )
                }
              </Dropdown.Menu>
            </Dropdown>
          </Nav.Item>
          {user ? <>
            <Link href='/user' passHref locale={locale} prefetch={false}>
              <Nav.Link>{translation.profile}</Nav.Link>
            </Link>
            <Nav.Link onClick={() => logout()}>{translation.logout}</Nav.Link>
          </>
            :
            <>
              <Link href='/login' passHref locale={locale} prefetch={false}>
                <Nav.Link>{translation.signIn}</Nav.Link>
              </Link>
              <Link href='/signup' passHref locale={locale} prefetch={false}>
                <Nav.Link>{translation.signUp}</Nav.Link>
              </Link>
            </>
          }
        </Nav>
      </NavbarComponent.Collapse>
    </NavbarComponent>
  )
}

export default Navbar
