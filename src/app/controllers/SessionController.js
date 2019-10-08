import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string('O campo E-mail deve ser uma string')
        .email('E-mail inválido')
        .required('O campo E-mail é obrigatório'),
      password: Yup.string('O campo senha deve ser uma string').required(
        'O campo senha é obrigatório'
      ),
    });

    if (!(await schema.isValid(req.body))) {
      await schema.validate(req.body, { abortEarly: false }).catch(err => {
        res.status(400).json({ errors: err.errors });
      });
      return res;
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não econtrado' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Confirmação de senha inválida' });
    }

    const { id, name } = user;
    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
