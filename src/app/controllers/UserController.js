import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string('Nome deve ser uma string').required(
        'O campo Nome é obrigatório'
      ),
      email: Yup.string('E-mail deve ser uma string')
        .email('E-mail inválido')
        .required('O campo E-mail é obrigatório'),
      password: Yup.string('O campo Senha deve ser uma string')
        .required('Senha é obrigatória')
        .min(6, 'O campo senha deve conter no minimo 6 dígitos'),
    });

    if (!(await schema.isValid(req.body))) {
      await schema.validate(req.body, { abortEarly: false }).catch(err => {
        res.status(400).json({ errors: err.errors });
      });
      return res;
    }

    const userExists = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }
    const { id, name, email, provider } = await User.create(req.body);

    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string('Nome deve ser uma string'),
      email: Yup.string('E-mail deve ser uma string').email('E-mail inválido'),
      oldPassword: Yup.string('A Senha antiga deve ser uma string').min(
        6,
        'O campo senha antiga deve conter no minimo 6 dígitos'
      ),
      password: Yup.string('O campo Senha deve ser uma string')
        .min(6, 'O campo senha deve conter no minimo 6 dígitos')
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required('O campo senha é obrigatório') : field
        ),
      confirmPassword: Yup.string('O campo Senha deve ser uma string').when(
        'password',
        (password, field) =>
          password
            ? field
                .required('Confirmação de senha é obrigatória')
                .oneOf([Yup.ref('password')], 'Confirmação de senha inválida')
            : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      await schema.validate(req.body, { abortEarly: false }).catch(err => {
        res.status(400).json({ errors: err.errors });
      });
      return res;
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Email do usuário está inválido.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({ error: 'Senha antiga inválida' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
